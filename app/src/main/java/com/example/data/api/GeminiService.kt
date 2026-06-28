package com.example.data.api

import com.example.BuildConfig
import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.RequestBody.Companion.toRequestBody
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.Query
import java.util.concurrent.TimeUnit

// --- Gemini API Models ---

@JsonClass(generateAdapter = true)
data class Part(
    @Json(name = "text") val text: String? = null
)

@JsonClass(generateAdapter = true)
data class Content(
    @Json(name = "parts") val parts: List<Part>
)

@JsonClass(generateAdapter = true)
data class ResponseSchema(
    @Json(name = "type") val type: String,
    @Json(name = "properties") val properties: Map<String, SchemaProperty>? = null,
    @Json(name = "required") val required: List<String>? = null
)

@JsonClass(generateAdapter = true)
data class SchemaProperty(
    @Json(name = "type") val type: String,
    @Json(name = "description") val description: String? = null
)

@JsonClass(generateAdapter = true)
data class ResponseFormat(
    @Json(name = "type") val type: String,
    @Json(name = "responseMimeType") val responseMimeType: String? = null,
    @Json(name = "responseSchema") val responseSchema: ResponseSchema? = null
)

@JsonClass(generateAdapter = true)
data class GenerationConfig(
    @Json(name = "temperature") val temperature: Float? = null,
    @Json(name = "responseMimeType") val responseMimeType: String? = null,
    @Json(name = "responseSchema") val responseSchema: ResponseSchema? = null
)

@JsonClass(generateAdapter = true)
data class GenerateContentRequest(
    @Json(name = "contents") val contents: List<Content>,
    @Json(name = "generationConfig") val generationConfig: GenerationConfig? = null,
    @Json(name = "systemInstruction") val systemInstruction: Content? = null
)

@JsonClass(generateAdapter = true)
data class Candidate(
    @Json(name = "content") val content: Content?
)

@JsonClass(generateAdapter = true)
data class GenerateContentResponse(
    @Json(name = "candidates") val candidates: List<Candidate>?
)

// --- Our App's Structured Response from Gemini ---

@JsonClass(generateAdapter = true)
data class OhdabAnalysisResult(
    @Json(name = "maskedIntro") val maskedIntro: String,
    @Json(name = "maskedClimax") val maskedClimax: String,
    @Json(name = "maskedAction") val maskedAction: String,
    @Json(name = "hook") val hook: String,
    @Json(name = "advice") val advice: String
)

interface GeminiApi {
    @POST("v1beta/models/gemini-3.5-flash:generateContent")
    suspend fun generateContent(
        @Query("key") apiKey: String,
        @Body request: GenerateContentRequest
    ): GenerateContentResponse
}

object GeminiClient {
    private const val BASE_URL = "https://generativelanguage.googleapis.com/"

    private val moshi = Moshi.Builder()
        .add(KotlinJsonAdapterFactory())
        .build()

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(60, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .build()

    val api: GeminiApi by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()
            .create(GeminiApi::class.java)
    }

    suspend fun analyzeStory(
        intro: String,
        climax: String,
        action: String
    ): OhdabAnalysisResult? {
        val apiKey = BuildConfig.GEMINI_API_KEY
        if (apiKey.isEmpty() || apiKey == "MY_GEMINI_API_KEY") {
            return null
        }

        val prompt = """
            Please analyze the following 3-step relationship story.
            Step 1 (Incident Origin): $intro
            Step 2 (Climax): $climax
            Step 3 (My Coping Response): $action

            Task:
            1. PII Scan & Filtering: Detect and automatically mask any specific real names, specific company names, and detailed local areas in Step 1, Step 2, and Step 3. For example, replace real names with "[그 인간]" or generic equivalents, specific companies with "[대기업]" or "[어느 회사]", and regions with "[어느 동네]".
            2. Highlight Hook: Pick or summarize a single, punchy, outrageous, or hilarious headline/quote (max 15 words) from the story that grabs the reader's attention. Write it in Korean.
            3. Grading Advice: Provide a short, witty, and humorous "incorrect relationship answer review" (오답 풀이) from an objective relationship guru. Speak in Korean, keeping it supportive yet playful and humorous.

            Return the response in JSON format matching the schema properties:
            - maskedIntro (string): Masked/filtered Step 1
            - maskedClimax (string): Masked/filtered Step 2
            - maskedAction (string): Masked/filtered Step 3
            - hook (string): Korean highlight hook
            - advice (string): Korean witty relationship grading advice (max 2-3 sentences)
        """.trimIndent()

        val systemInstruction = """
            You are "Ohdab Romance (오답연애) Guru" - a witty, objective, gender-neutral relationship coach.
            Your role is to mask real private identifiers (PII) to ensure anonymity and provide hilarious, comforting red-pen relationship feedback.
            You must output JSON strictly conforming to the requested schema.
        """.trimIndent()

        // Define Schema for structured output
        val schema = ResponseSchema(
            type = "OBJECT",
            properties = mapOf(
                "maskedIntro" to SchemaProperty("STRING", "The filtered and masked intro"),
                "maskedClimax" to SchemaProperty("STRING", "The filtered and masked climax"),
                "maskedAction" to SchemaProperty("STRING", "The filtered and masked action"),
                "hook" to SchemaProperty("STRING", "A punchy, hilarious Korean highlight quote from the story"),
                "advice" to SchemaProperty("STRING", "Funny Korean red-pen grading feedback")
            ),
            required = listOf("maskedIntro", "maskedClimax", "maskedAction", "hook", "advice")
        )

        val request = GenerateContentRequest(
            contents = listOf(Content(parts = listOf(Part(text = prompt)))),
            generationConfig = GenerationConfig(
                temperature = 0.7f,
                responseMimeType = "application/json",
                responseSchema = schema
            ),
            systemInstruction = Content(parts = listOf(Part(text = systemInstruction)))
        )

        return try {
            val response = api.generateContent(apiKey, request)
            val jsonText = response.candidates?.firstOrNull()?.content?.parts?.firstOrNull()?.text
            if (jsonText != null) {
                moshi.adapter(OhdabAnalysisResult::class.java).fromJson(jsonText)
            } else {
                null
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}

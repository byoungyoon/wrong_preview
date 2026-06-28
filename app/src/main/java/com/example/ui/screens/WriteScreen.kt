package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ui.theme.*
import com.example.ui.viewmodel.OhdabViewModel
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WriteScreen(
    viewModel: OhdabViewModel,
    modifier: Modifier = Modifier
) {
    val intro by viewModel.draftIntro.collectAsStateWithLifecycle()
    val climax by viewModel.draftClimax.collectAsStateWithLifecycle()
    val action by viewModel.draftAction.collectAsStateWithLifecycle()
    val nickname by viewModel.draftNickname.collectAsStateWithLifecycle()
    val selectedTags by viewModel.selectedTags.collectAsStateWithLifecycle()
    val isAnalyzing by viewModel.isAnalyzing.collectAsStateWithLifecycle()
    val aiResult by viewModel.aiResult.collectAsStateWithLifecycle()

    val focusManager = LocalFocusManager.current
    val scrollState = rememberScrollState()

    val availableTags = listOf(
        "#회피형_잠수함",
        "#가성비_집착러",
        "#눈물의_가스라이팅",
        "#환승이별_장인",
        "#질투의_화신",
        "#전애인_염탐러",
        "#소심끝판왕",
        "#연락두절_잠수교",
        "#비밀번호_털이범",
        "#유령_이별"
    )

    // Animated loading messages
    var loadingMessage by remember { mutableStateOf("AI가 사연의 전반적인 맥락 파악 중...") }
    LaunchedEffect(isAnalyzing) {
        if (isAnalyzing) {
            val messages = listOf(
                "AI가 사연의 전반적인 맥락 파악 중...",
                "실명, 특정 회사, 세부 지명 등 특정성 식별 중...",
                "실시간 자동 익명 마스킹 가공 처리 중...",
                "오답노트 맞춤형 빨간 펜 코칭 답변 작성 중..."
            )
            var index = 0
            while (isAnalyzing) {
                loadingMessage = messages[index]
                delay(1500)
                index = (index + 1) % messages.size
            }
        }
    }

    Box(modifier = modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(16.dp)
                .testTag("write_container"),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Heading Banner
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surface, RoundedCornerShape(24.dp))
                    .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.2f), RoundedCornerShape(24.dp))
                    .padding(16.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.AutoAwesome,
                        contentDescription = null,
                        tint = GoldAccent,
                        modifier = Modifier.size(32.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = "구조화된 연애 오답노트 적기",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = "줄글 대신 3단계 양식으로 적어 가독성을 높입니다. AI 분석을 실행하면 실명/회사 등이 마스킹 처리되고, 오답 훈수 코멘트가 자동 발행됩니다.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            lineHeight = 16.sp
                        )
                    }
                }
            }

            // Pseudo-Anonymous Nickname Combination
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.15f), RoundedCornerShape(24.dp)),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "임시 부여된 닉네임",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = nickname,
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.primary
                        )
                    }

                    // Rotating animation for refresh
                    var isRotated by remember { mutableStateOf(false) }
                    val rotationDegrees by animateFloatAsState(
                        targetValue = if (isRotated) 360f else 0f,
                        animationSpec = tween(durationMillis = 500)
                    )

                    IconButton(
                        onClick = {
                            isRotated = !isRotated
                            viewModel.generateRandomNickname()
                        },
                        modifier = Modifier
                            .background(MaterialTheme.colorScheme.surfaceVariant, CircleShape)
                            .rotate(rotationDegrees)
                            .testTag("refresh_nickname_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "새 닉네임 조합",
                            tint = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }

            // Structured 3 Steps
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                // Step 1: 사건의 발단
                OhdabInputField(
                    value = intro,
                    onValueChange = { viewModel.updateDraftIntro(it) },
                    label = "1단계: 📝 [사건의 발단]",
                    placeholder = "예: 연애한 지 200일쯤 되었을 때, 갑자기 상대가 사소한 연락에도 짜증을 부리기 시작하더니...",
                    tag = "input_intro"
                )

                // Step 2: 클라이맥스
                OhdabInputField(
                    value = climax,
                    onValueChange = { viewModel.updateDraftClimax(it) },
                    label = "2단계: 💥 [클라이맥스]",
                    placeholder = "예: 갑자기 약속을 일방적으로 파토 내고 잠수를 타더니 일주일 뒤 멀쩡히 프사가 바뀌었습니다.",
                    tag = "input_climax"
                )

                // Step 3: 나의 대처
                OhdabInputField(
                    value = action,
                    onValueChange = { viewModel.updateDraftAction(it) },
                    label = "3단계: 💡 [나의 대처]",
                    placeholder = "예: 내가 무슨 잘못을 했나 밤새 자책하면서 부재중 전화를 10통 남기고 매달렸어요.",
                    tag = "input_action"
                )
            }

            // Tags selection
            Text(
                text = "📌 필수 오답 태그 선택 (중복 가능)",
                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onSurface
            )

            // FlowRow equivalent for tags wrapping beautifully
            Column(modifier = Modifier.fillMaxWidth()) {
                val chunkSize = 3
                val rows = availableTags.chunked(chunkSize)
                rows.forEach { rowTags ->
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        rowTags.forEach { tag ->
                            val isSelected = selectedTags.contains(tag)
                            Box(
                                modifier = Modifier
                                    .weight(1.0f)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(if (isSelected) RedPenPrimary else MaterialTheme.colorScheme.surfaceVariant)
                                    .border(
                                        width = 1.dp,
                                        color = if (isSelected) Color.Transparent else MaterialTheme.colorScheme.outline.copy(alpha = 0.2f),
                                        shape = RoundedCornerShape(12.dp)
                                    )
                                    .clickable { viewModel.toggleTag(tag) }
                                    .padding(vertical = 10.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = tag,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                        // Pad row to ensure grid holds layout evenly
                        if (rowTags.size < chunkSize) {
                            repeat(chunkSize - rowTags.size) {
                                Spacer(modifier = Modifier.weight(1.0f))
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // AI Action & Verification Section
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // AI mask button
                Button(
                    onClick = {
                        focusManager.clearFocus()
                        viewModel.runAiAnalysis()
                    },
                    modifier = Modifier
                        .weight(1.0f)
                        .testTag("ai_analysis_button"),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = GoldAccent,
                        contentColor = Color.Black
                    ),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Icon(imageVector = Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("AI 익명 마스킹 & 오답 풀이", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
            }

            // AI Analysis Output Preview Card
            AnimatedVisibility(visible = aiResult != null) {
                aiResult?.let { result ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, RedPenPrimary.copy(alpha = 0.3f), RoundedCornerShape(24.dp)),
                        colors = CardDefaults.cardColors(containerColor = RedPenContainer.copy(alpha = 0.2f))
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.AutoAwesome,
                                    contentDescription = null,
                                    tint = RedPenPrimary,
                                    modifier = Modifier.size(24.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "✨ AI 오답노트 검토 결과",
                                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                    color = RedPenPrimary
                                )
                            }

                            Spacer(modifier = Modifier.height(12.dp))

                            Text(
                                text = "🚩 자동 추출된 핵심 훅:",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Text(
                                text = "\"${result.hook}\"",
                                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onSurface
                            )

                            Spacer(modifier = Modifier.height(12.dp))

                            Text(
                                text = "🎓 빨간 펜 코칭 오답 풀이 (글 등록시 자동 첨부):",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Text(
                                text = result.advice,
                                style = MaterialTheme.typography.bodyMedium.copy(lineHeight = 18.sp),
                                color = MaterialTheme.colorScheme.primary
                            )

                            Spacer(modifier = Modifier.height(8.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(Icons.Default.Info, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "실명/특정 회사/지명이 감지되어 안전하게 필터링 완료!",
                                    fontSize = 10.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }
            }

            // Register/Publish Button
            Button(
                onClick = {
                    focusManager.clearFocus()
                    viewModel.submitPost()
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .testTag("submit_post_button"),
                colors = ButtonDefaults.buttonColors(
                    containerColor = RedPenPrimary,
                    contentColor = Color.White
                ),
                shape = RoundedCornerShape(16.dp)
            ) {
                Text("오답노트 등록하기 🔴", fontWeight = FontWeight.Bold, fontSize = 15.sp)
            }

            Spacer(modifier = Modifier.height(40.dp))
        }

        // Full-screen loading modal overlay during AI analysis
        if (isAnalyzing) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.8f))
                    .clickable(enabled = false) {}, // Block clicks
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(24.dp)
                ) {
                    // Custom AI scan effect indicator
                    CircularProgressIndicator(
                        color = GoldAccent,
                        strokeWidth = 4.dp,
                        modifier = Modifier.size(64.dp)
                    )
                    Spacer(modifier = Modifier.height(24.dp))
                    Text(
                        text = "Ohdab AI Scanner",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = GoldAccent
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = loadingMessage,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.White,
                        textAlign = TextAlign.Center
                    )
                }
            }
        }
    }
}

@Composable
fun OhdabInputField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    placeholder: String,
    tag: String
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
            color = MaterialTheme.colorScheme.onSurface,
            modifier = Modifier.padding(bottom = 6.dp)
        )

        TextField(
            value = value,
            onValueChange = onValueChange,
            placeholder = { Text(placeholder, color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f), fontSize = 13.sp) },
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 100.dp)
                .testTag(tag),
            colors = TextFieldDefaults.colors(
                focusedContainerColor = MaterialTheme.colorScheme.surface,
                unfocusedContainerColor = MaterialTheme.colorScheme.surface,
                focusedTextColor = MaterialTheme.colorScheme.onSurface,
                unfocusedTextColor = MaterialTheme.colorScheme.onSurface,
                focusedIndicatorColor = RedPenPrimary,
                unfocusedIndicatorColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f),
                cursorColor = RedPenPrimary
            ),
            shape = RoundedCornerShape(12.dp)
        )
    }
}

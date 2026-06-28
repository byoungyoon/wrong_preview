package com.example.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import androidx.room.Room
import com.example.data.api.GeminiClient
import com.example.data.api.OhdabAnalysisResult
import com.example.data.db.OhdabDatabase
import com.example.data.model.Comment
import com.example.data.model.OhdabPost
import com.example.data.repository.OhdabRepository
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.UUID

class OhdabViewModel(application: Application) : AndroidViewModel(application) {

    private val db = Room.databaseBuilder(
        application,
        OhdabDatabase::class.java, "ohdab_database"
    ).build()

    private val repository = OhdabRepository(db.ohdabDao())

    // All posts
    val allPosts: StateFlow<List<OhdabPost>> = repository.allPosts
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    // User's own posts
    val userPosts: StateFlow<List<OhdabPost>> = repository.userPosts
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    // Current active post's comments
    private val _activePostIdForComments = MutableStateFlow<String?>(null)
    val activePostIdForComments = _activePostIdForComments.asStateFlow()

    private val _commentsState = MutableStateFlow<List<Comment>>(emptyList())
    val commentsState = _commentsState.asStateFlow()

    // Create Draft states
    private val _draftIntro = MutableStateFlow("")
    val draftIntro = _draftIntro.asStateFlow()

    private val _draftClimax = MutableStateFlow("")
    val draftClimax = _draftClimax.asStateFlow()

    private val _draftAction = MutableStateFlow("")
    val draftAction = _draftAction.asStateFlow()

    private val _selectedTags = MutableStateFlow<Set<String>>(emptySet())
    val selectedTags = _selectedTags.asStateFlow()

    private val _draftNickname = MutableStateFlow("")
    val draftNickname = _draftNickname.asStateFlow()

    private val _isAnalyzing = MutableStateFlow(false)
    val isAnalyzing = _isAnalyzing.asStateFlow()

    private val _aiResult = MutableStateFlow<OhdabAnalysisResult?>(null)
    val aiResult = _aiResult.asStateFlow()

    // Gamification statistics
    private val _voteCount = MutableStateFlow(0)
    val voteCount = _voteCount.asStateFlow()

    private val _commentCount = MutableStateFlow(0)
    val commentCount = _commentCount.asStateFlow()

    // Simulated notifications
    private val _notifications = MutableStateFlow<List<MockNotification>>(emptyList())
    val notifications = _notifications.asStateFlow()

    private val _eventFlow = MutableSharedFlow<UiEvent>()
    val eventFlow = _eventFlow.asSharedFlow()

    private val adjectives = listOf("매운맛", "서정적인", "바삭한", "폭주하는", "소심한", "억울한", "말랑말랑한", "고뇌하는", "눈물의", "화끈한")
    private val nouns = listOf("잠봉뵈르", "팩폭러", "프로오답러", "고구마수집가", "눈물왕", "쿠쿠다스", "라떼감별사", "치즈핫도그", "피자덕후")

    sealed class UiEvent {
        data class ShowSnackbar(val message: String) : UiEvent()
        object PostCreated : UiEvent()
    }

    data class MockNotification(
        val id: String = UUID.randomUUID().toString(),
        val message: String,
        val timestamp: Long = System.currentTimeMillis(),
        val isRead: Boolean = false
    )

    init {
        viewModelScope.launch {
            repository.prepopulateIfEmpty()
            generateRandomNickname()
            loadMockNotifications()
        }

        // Observe comments for active post
        viewModelScope.launch {
            _activePostIdForComments.collect { postId ->
                if (postId != null) {
                    repository.getCommentsForPost(postId).collect { comments ->
                        _commentsState.value = comments
                    }
                } else {
                    _commentsState.value = emptyList()
                }
            }
        }
    }

    fun generateRandomNickname() {
        val adj = adjectives.random()
        val noun = nouns.random()
        _draftNickname.value = "${adj}_${noun}"
    }

    fun updateDraftIntro(value: String) {
        _draftIntro.value = value
    }

    fun updateDraftClimax(value: String) {
        _draftClimax.value = value
    }

    fun updateDraftAction(value: String) {
        _draftAction.value = value
    }

    fun toggleTag(tag: String) {
        val current = _selectedTags.value
        _selectedTags.value = if (current.contains(tag)) {
            current - tag
        } else {
            current + tag
        }
    }

    fun setCommentsActivePost(postId: String?) {
        _activePostIdForComments.value = postId
    }

    // AI scan using Gemini API
    fun runAiAnalysis() {
        if (_draftIntro.value.isBlank() || _draftClimax.value.isBlank() || _draftAction.value.isBlank()) {
            viewModelScope.launch {
                _eventFlow.emit(UiEvent.ShowSnackbar("모든 단계의 사연 내용을 입력해 주세요."))
            }
            return
        }

        _isAnalyzing.value = true
        _aiResult.value = null

        viewModelScope.launch {
            val result = GeminiClient.analyzeStory(
                _draftIntro.value,
                _draftClimax.value,
                _draftAction.value
            )
            _isAnalyzing.value = false
            if (result != null) {
                _aiResult.value = result
                _eventFlow.emit(UiEvent.ShowSnackbar("AI 필터링 및 오답 분석이 완료되었습니다!"))
            } else {
                _eventFlow.emit(UiEvent.ShowSnackbar("AI 분석 실패. API 키 설정 확인 및 인터넷 네트워크를 체크해 주세요."))
            }
        }
    }

    // Submit post
    fun submitPost() {
        val nickname = _draftNickname.value
        val tagsString = _selectedTags.value.joinToString(",")
        val intro = _aiResult.value?.maskedIntro ?: _draftIntro.value
        val climax = _aiResult.value?.maskedClimax ?: _draftClimax.value
        val action = _aiResult.value?.maskedAction ?: _draftAction.value
        val hook = _aiResult.value?.hook ?: if (climax.length > 30) climax.take(30) + "..." else climax

        if (intro.isBlank() || climax.isBlank() || action.isBlank()) {
            viewModelScope.launch {
                _eventFlow.emit(UiEvent.ShowSnackbar("내용을 비워둘 수 없습니다."))
            }
            return
        }

        if (_selectedTags.value.isEmpty()) {
            viewModelScope.launch {
                _eventFlow.emit(UiEvent.ShowSnackbar("최소 1개의 오답 태그를 선택해 주세요."))
            }
            return
        }

        viewModelScope.launch {
            val newPost = OhdabPost(
                id = "ohdab_post_user_" + System.currentTimeMillis(),
                nickname = nickname,
                avatarId = "avatar_crayon_user",
                tags = tagsString,
                hook = hook,
                stepIntro = intro,
                stepClimax = climax,
                stepAction = action,
                voteAuthorFault = 0,
                votePartnerFault = 0,
                sympathyCount = 0,
                angerCount = 0,
                isUserPost = true
            )
            repository.insertPost(newPost)
            
            // If AI analyzed, save the custom coaching advice as an initial comment by "오답 코치"
            _aiResult.value?.advice?.let { advice ->
                repository.addComment(newPost.id, advice, "🎓_오답연애_코치")
            }

            _eventFlow.emit(UiEvent.ShowSnackbar("나의 아찔한 오답노트가 성공적으로 등록되었습니다!"))
            resetDraft()
            _eventFlow.emit(UiEvent.PostCreated)

            // Trigger a simulated notification in 3 seconds to keep dopamine levels up!
            simulateRetentionNotification(newPost.hook)
        }
    }

    private fun resetDraft() {
        _draftIntro.value = ""
        _draftClimax.value = ""
        _draftAction.value = ""
        _selectedTags.value = emptySet()
        _aiResult.value = null
        generateRandomNickname()
    }

    // Voting
    fun vote(post: OhdabPost, isAuthorFault: Boolean) {
        if (post.userVoted != 0) return // Already voted

        viewModelScope.launch {
            val updatedPost = post.copy(
                voteAuthorFault = post.voteAuthorFault + if (isAuthorFault) 1 else 0,
                votePartnerFault = post.votePartnerFault + if (!isAuthorFault) 1 else 0,
                userVoted = if (isAuthorFault) 1 else 2
            )
            repository.updatePost(updatedPost)
            _voteCount.value = _voteCount.value + 1

            // Trigger mock notification of someone else voting or rating
            if (post.isUserPost) {
                val voteType = if (isAuthorFault) "글쓴이 오답" else "상대 오답"
                addMockNotification("누군가 당신의 오답노트에 '$voteType' 표를 던졌습니다!")
            }
        }
    }

    // Reactions (Sympathy and Anger)
    fun react(post: OhdabPost, isSympathy: Boolean) {
        viewModelScope.launch {
            val updatedPost = if (isSympathy) {
                val active = !post.userReactedSympathy
                post.copy(
                    sympathyCount = post.sympathyCount + if (active) 1 else -1,
                    userReactedSympathy = active
                )
            } else {
                val active = !post.userReactedAnger
                post.copy(
                    angerCount = post.angerCount + if (active) 1 else -1,
                    userReactedAnger = active
                )
            }
            repository.updatePost(updatedPost)
            
            if (post.isUserPost && (isSympathy && !post.userReactedSympathy || !isSympathy && !post.userReactedAnger)) {
                val reactionType = if (isSympathy) "'토닥토닥' 공감" else "'혈압 상승' 분노"
                addMockNotification("당신의 오답노트에 새로운 $reactionType 반응이 달렸습니다!")
            }
        }
    }

    // Comment
    fun submitComment(text: String) {
        val postId = _activePostIdForComments.value ?: return
        if (text.isBlank()) return

        viewModelScope.launch {
            // Find appropriate commenter anonymous id for this post
            val currentComments = _commentsState.value
            val userPastComments = currentComments.filter { it.nickname.startsWith("익명") }
            val authorOfPost = allPosts.value.find { it.id == postId }
            
            val myCommenterName = if (authorOfPost?.isUserPost == true) {
                "작성자"
            } else {
                val count = currentComments.map { it.nickname }.distinct().filter { it.startsWith("익명") }.size
                "익명 ${count + 1}"
            }

            repository.addComment(postId, text, myCommenterName)
            _commentCount.value = _commentCount.value + 1

            // If it's a user post, send notification
            if (authorOfPost?.isUserPost == true) {
                addMockNotification("누군가 당신의 오답노트에 한마디 남겼습니다: \"$text\"")
            }
        }
    }

    // Notification Mocking
    private fun loadMockNotifications() {
        _notifications.value = listOf(
            MockNotification(message = "🎉 '오답연애' 커뮤니티에 오신 것을 환영합니다! 연애 흑역사 오답노트를 작성해보세요."),
            MockNotification(message = "🎓 오답연애 팁: 글 작성 시 AI 분석 기능을 사용하면 실명이나 지역을 자동으로 깔끔하게 가려줍니다.")
        )
    }

    private fun addMockNotification(message: String) {
        val newList = listOf(MockNotification(message = message)) + _notifications.value
        _notifications.value = newList.take(15) // Keep last 15
    }

    private fun simulateRetentionNotification(postHook: String) {
        viewModelScope.launch {
            kotlinx.coroutines.delay(4000)
            addMockNotification("📈 내 오답노트 '$postHook' 글이 실시간 주간 베스트 오답 TOP 3에 올랐습니다!")
            _eventFlow.emit(UiEvent.ShowSnackbar("새로운 알림이 도착했습니다: 내 글이 베스트 오답 TOP 3 진입!"))
        }
    }

    fun clearNotifications() {
        _notifications.value = emptyList()
    }

    // Database cleaning on close
    override fun onCleared() {
        super.onCleared()
        db.close()
    }
}

package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.model.Comment
import com.example.data.model.OhdabPost
import com.example.ui.theme.*
import com.example.ui.viewmodel.OhdabViewModel
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeedScreen(
    viewModel: OhdabViewModel,
    modifier: Modifier = Modifier
) {
    val posts by viewModel.allPosts.collectAsStateWithLifecycle()
    val activePostIdForComments by viewModel.activePostIdForComments.collectAsStateWithLifecycle()
    val comments by viewModel.commentsState.collectAsStateWithLifecycle()
    val sheetState = rememberModalBottomSheetState()
    val scope = rememberCoroutineScope()
    var commentText by remember { mutableStateOf("") }
    val focusManager = LocalFocusManager.current

    // Calculate dynamic stats based on posts
    val totalGlobalVotes = posts.sumOf { it.voteAuthorFault + it.votePartnerFault } + 148 // Seed to match 12,402 style count
    val averagePartnerFault = if (posts.isNotEmpty()) {
        val totalPartner = posts.sumOf { it.votePartnerFault }
        val total = posts.sumOf { it.voteAuthorFault + it.votePartnerFault }
        if (total > 0) (totalPartner * 100 / total) else 78
    } else 78

    Box(modifier = modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .testTag("feed_list"),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // 1. Theme-inspired Header Component
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.primaryContainer),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "🎓",
                                fontSize = 20.sp,
                                color = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        }
                        Column {
                            Text(
                                text = "익명 연애 오답 연구소",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "오늘의 오답 집중 분석",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                    IconButton(
                        onClick = { /* Notification action */ },
                        modifier = Modifier
                            .size(40.dp)
                            .background(MaterialTheme.colorScheme.surface, CircleShape)
                            .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.2f), CircleShape)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Notifications,
                            contentDescription = "알림",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            // 2. High-Density Hero Widget Card (Spotlight Romance Incident)
            item {
                val spotlightPost = posts.maxByOrNull { it.voteAuthorFault + it.votePartnerFault } ?: posts.firstOrNull()
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(24.dp))
                        .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.1f), RoundedCornerShape(24.dp)),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .background(MaterialTheme.colorScheme.onPrimaryContainer, RoundedCornerShape(50.dp))
                                    .padding(horizontal = 10.dp, vertical = 4.dp)
                            ) {
                                Text(
                                    text = "실시간 명예의 대오답 🏆",
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                    color = MaterialTheme.colorScheme.primaryContainer
                                )
                            }
                            Icon(
                                imageVector = Icons.Default.MoreVert,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.Bottom
                        ) {
                            Column(modifier = Modifier.weight(1.0f).padding(end = 8.dp)) {
                                Text(
                                    text = "상대 과실 $averagePartnerFault%",
                                    fontFamily = FontFamily.Monospace,
                                    fontSize = 32.sp,
                                    fontWeight = FontWeight.Black,
                                    color = MaterialTheme.colorScheme.onPrimaryContainer,
                                    letterSpacing = (-1).sp
                                )
                                Text(
                                    text = spotlightPost?.hook ?: "어이없는 회피형 잠수 이별 에피소드",
                                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                                    color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.8f),
                                    maxLines = 1
                                )
                            }

                            Button(
                                onClick = {
                                    spotlightPost?.let { viewModel.setCommentsActivePost(it.id) }
                                },
                                modifier = Modifier.size(48.dp),
                                shape = RoundedCornerShape(16.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = MaterialTheme.colorScheme.onPrimaryContainer,
                                    contentColor = MaterialTheme.colorScheme.primaryContainer
                                ),
                                contentPadding = PaddingValues(0.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Sms,
                                    contentDescription = "바로 참견하기"
                                )
                            }
                        }
                    }
                }
            }

            // 3. Mini Stats Row (High-Density Columns)
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Stat Card 1: Energy analog - "연애 자성 온도"
                    Card(
                        modifier = Modifier
                            .weight(1.0f)
                            .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.15f), RoundedCornerShape(24.dp)),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                    ) {
                        Column(
                            modifier = Modifier.padding(14.dp),
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Bolt,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.onBackground,
                                    modifier = Modifier.size(16.dp)
                                )
                                Text(
                                    text = "연애 자성율",
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Black),
                                    color = MaterialTheme.colorScheme.onBackground
                                )
                            }
                            Text(
                                text = "84%",
                                fontSize = 22.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onBackground
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            LinearProgressIndicator(
                                progress = { 0.84f },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(6.dp)
                                    .clip(RoundedCornerShape(3.dp)),
                                color = MaterialTheme.colorScheme.primary,
                                trackColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f)
                            )
                        }
                    }

                    // Stat Card 2: Steps analog - "오늘의 대중 참견 참여"
                    Card(
                        modifier = Modifier
                            .weight(1.0f)
                            .border(1.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(24.dp)),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                    ) {
                        Column(
                            modifier = Modifier.padding(14.dp),
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.HowToVote,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.size(16.dp)
                                )
                                Text(
                                    text = "실시간 참견",
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Black),
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            Text(
                                text = String.format("%,d", totalGlobalVotes),
                                fontSize = 22.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "목표 인원의 92% 달성",
                                fontSize = 9.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }

            // 4. Today's Focus Title Section
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "아찔한 오답 피드 목록",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onBackground
                    )
                    Text(
                        text = "전체보기",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.clickable { /* Filter actions */ }
                    )
                }
            }

            // 5. High-Density Feed list items
            if (posts.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 48.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "등록된 오답노트가 없습니다.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            } else {
                items(posts, key = { it.id }) { post ->
                    OhdabPostCard(
                        post = post,
                        onVote = { isAuthor -> viewModel.vote(post, isAuthor) },
                        onReactSympathy = { viewModel.react(post, true) },
                        onReactAnger = { viewModel.react(post, false) },
                        onOpenComments = { viewModel.setCommentsActivePost(post.id) }
                    )
                }
            }
        }

        // Comments Bottom Sheet
        if (activePostIdForComments != null) {
            ModalBottomSheet(
                onDismissRequest = { viewModel.setCommentsActivePost(null) },
                sheetState = sheetState,
                containerColor = MaterialTheme.colorScheme.surface,
                contentColor = MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.testTag("comments_bottom_sheet")
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxHeight(0.75f)
                        .padding(bottom = WindowInsets.navigationBars.asPaddingValues().calculateBottomPadding())
                ) {
                    // Header
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "참견 및 위로 한마디 (${comments.size})",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        IconButton(
                            onClick = {
                                scope.launch { sheetState.hide() }.invokeOnCompletion {
                                    if (!sheetState.isVisible) {
                                        viewModel.setCommentsActivePost(null)
                                    }
                                }
                            }
                        ) {
                            Icon(imageVector = Icons.Default.Close, contentDescription = "닫기", tint = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))

                    // Comments List
                    LazyColumn(
                        modifier = Modifier
                            .weight(1.0f)
                            .fillMaxWidth(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        if (comments.isEmpty()) {
                            item {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 48.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "아직 참견이 없습니다. 따뜻한 위로를 건네보세요!",
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        textAlign = TextAlign.Center
                                    )
                                }
                            }
                        } else {
                            items(comments) { comment ->
                                CommentItem(comment = comment)
                            }
                        }
                    }

                    // Input Row
                    HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(MaterialTheme.colorScheme.surface)
                            .padding(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        TextField(
                            value = commentText,
                            onValueChange = { commentText = it },
                            placeholder = { Text("참견 한마디로 연애 해독하기...", color = MaterialTheme.colorScheme.onSurfaceVariant) },
                            modifier = Modifier
                                .weight(1.0f)
                                .padding(end = 8.dp)
                                .testTag("comment_input"),
                            colors = TextFieldDefaults.colors(
                                focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                                unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                                focusedTextColor = MaterialTheme.colorScheme.onSurface,
                                unfocusedTextColor = MaterialTheme.colorScheme.onSurface,
                                cursorColor = RedPenPrimary,
                                focusedIndicatorColor = Color.Transparent,
                                unfocusedIndicatorColor = Color.Transparent
                            ),
                            shape = RoundedCornerShape(24.dp)
                        )

                        FloatingActionButton(
                            onClick = {
                                if (commentText.isNotBlank()) {
                                    viewModel.submitComment(commentText)
                                    commentText = ""
                                    focusManager.clearFocus()
                                }
                            },
                            containerColor = RedPenPrimary,
                            contentColor = Color.White,
                            modifier = Modifier
                                .size(48.dp)
                                .testTag("comment_send_button"),
                            shape = CircleShape,
                            elevation = FloatingActionButtonDefaults.elevation(0.dp, 0.dp)
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.Send,
                                contentDescription = "전송",
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun OhdabPostCard(
    post: OhdabPost,
    onVote: (Boolean) -> Unit,
    onReactSympathy: () -> Unit,
    onReactAnger: () -> Unit,
    onOpenComments: () -> Unit,
    modifier: Modifier = Modifier
) {
    val totalVotes = post.voteAuthorFault + post.votePartnerFault
    val isVoted = post.userVoted != 0

    Card(
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.15f), RoundedCornerShape(24.dp)),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(24.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            // Header: Nickname & Avatar & Date
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .background(
                            color = when (post.avatarId) {
                                "avatar_crayon_red" -> Color(0xFFFECDD3)
                                "avatar_crayon_yellow" -> Color(0xFFFEF08A)
                                "avatar_crayon_blue" -> Color(0xFFBFDBFE)
                                else -> Color(0xFFE8DEF8)
                            },
                            shape = CircleShape
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = when (post.avatarId) {
                            "avatar_crayon_red" -> "😡"
                            "avatar_crayon_yellow" -> "🤔"
                            "avatar_crayon_blue" -> "😭"
                            else -> "👤"
                        },
                        fontSize = 20.sp
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = post.nickname,
                            style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        if (post.isUserPost) {
                            Spacer(modifier = Modifier.width(6.dp))
                            Box(
                                modifier = Modifier
                                    .background(RedPenPrimary.copy(alpha = 0.2f), RoundedCornerShape(4.dp))
                                    .padding(horizontal = 4.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = "작성자",
                                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                    color = RedPenPrimary
                                )
                            }
                        }
                    }
                    Text(
                        text = "아찔했던 오답 노트",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Highlight Hook (상단 거대 훅)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(16.dp))
                    .padding(14.dp)
                    .drawBehind {
                        // Custom decorative red checkmark at the corner
                        drawCircle(
                            color = RedPenPrimary.copy(alpha = 0.05f),
                            radius = 80f,
                            center = Offset(size.width - 60f, 60f)
                        )
                    }
            ) {
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "“",
                            fontSize = 32.sp,
                            fontWeight = FontWeight.Bold,
                            color = RedPenPrimary,
                            lineHeight = 0.sp
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = post.hook,
                            style = MaterialTheme.typography.bodyMedium.copy(
                                fontWeight = FontWeight.Black,
                                lineHeight = 18.sp
                            ),
                            color = MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.weight(1.0f)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Notebook-styled steps container
            NotebookPaperContainer {
                Column(modifier = Modifier.padding(12.dp)) {
                    StepSection(title = "📝 [사건의 발단]", content = post.stepIntro)
                    Spacer(modifier = Modifier.height(12.dp))
                    StepSection(title = "💥 [클라이맥스]", content = post.stepClimax, highlight = true)
                    Spacer(modifier = Modifier.height(12.dp))
                    StepSection(title = "💡 [나의 대처]", content = post.stepAction)
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Hashtag Tags Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Start
            ) {
                post.tags.split(",").forEach { tag ->
                    if (tag.isNotBlank()) {
                        Box(
                            modifier = Modifier
                                .padding(end = 6.dp)
                                .background(MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(8.dp))
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = tag,
                                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Medium),
                                color = GoldAccent
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // AITA (내가 잘못했나?) Voting system
            Text(
                text = "📊 이 상황, 누구 과실이 더 큰가요?",
                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.padding(bottom = 8.dp)
            )

            if (!isVoted) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = { onVote(true) },
                        modifier = Modifier
                            .weight(1.0f)
                            .testTag("vote_author_button"),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.surfaceVariant,
                            contentColor = MaterialTheme.colorScheme.onSurface
                        ),
                        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("내가 오답이었다", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            Text("자책/후회", fontSize = 9.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }

                    Button(
                        onClick = { onVote(false) },
                        modifier = Modifier
                            .weight(1.0f)
                            .testTag("vote_partner_button"),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = RedPenContainer.copy(alpha = 0.5f),
                            contentColor = RedPenOnContainer
                        ),
                        border = BorderStroke(1.dp, RedPenPrimary.copy(alpha = 0.5f)),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("상대가 대오답이다", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = RedPenPrimary)
                            Text("상대방 과실 100%", fontSize = 9.sp, color = RedPenPrimary.copy(alpha = 0.8f))
                        }
                    }
                }
            } else {
                // Post-voting Results Bar
                val authorPercent = if (totalVotes > 0) (post.voteAuthorFault * 100 / totalVotes) else 0
                val partnerPercent = if (totalVotes > 0) (post.votePartnerFault * 100 / totalVotes) else 0

                val myVoteText = if (post.userVoted == 1) " (내 투표)" else ""
                val partnerVoteText = if (post.userVoted == 2) " (내 투표)" else ""

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(12.dp))
                        .padding(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "내가 오답$myVoteText",
                            style = MaterialTheme.typography.bodySmall,
                            color = if (post.userVoted == 1) RedPenPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
                            fontWeight = if (post.userVoted == 1) FontWeight.Bold else FontWeight.Normal
                        )
                        Text(
                            text = "$authorPercent% (${post.voteAuthorFault}표)",
                            style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    LinearProgressIndicator(
                        progress = { authorPercent.toFloat() / 100f },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                            .clip(RoundedCornerShape(4.dp)),
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        trackColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "상대가 대오답$partnerVoteText",
                            style = MaterialTheme.typography.bodySmall,
                            color = if (post.userVoted == 2) RedPenPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
                            fontWeight = if (post.userVoted == 2) FontWeight.Bold else FontWeight.Normal
                        )
                        Text(
                            text = "$partnerPercent% (${post.votePartnerFault}표)",
                            style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                            color = RedPenPrimary
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    LinearProgressIndicator(
                        progress = { partnerPercent.toFloat() / 100f },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                            .clip(RoundedCornerShape(4.dp)),
                        color = RedPenPrimary,
                        trackColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))
            HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.15f))

            // Bottom Actions: Sympathy, Anger, Open Comments
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Empathy: Sympathy (토닥토닥)
                ActionButton(
                    icon = Icons.Default.Favorite,
                    count = post.sympathyCount,
                    label = "토닥토닥",
                    isActive = post.userReactedSympathy,
                    activeColor = RedPenPrimary,
                    inactiveColor = MaterialTheme.colorScheme.onSurfaceVariant,
                    onClick = onReactSympathy,
                    tag = "react_sympathy_${post.id}"
                )

                // Empathy: Anger (혈압상승)
                ActionButton(
                    icon = Icons.Default.Whatshot,
                    count = post.angerCount,
                    label = "혈압상승",
                    isActive = post.userReactedAnger,
                    activeColor = GoldAccent,
                    inactiveColor = MaterialTheme.colorScheme.onSurfaceVariant,
                    onClick = onReactAnger,
                    tag = "react_anger_${post.id}"
                )

                // Comments link
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .clickable { onOpenComments() }
                        .padding(horizontal = 8.dp, vertical = 6.dp)
                        .testTag("open_comments_${post.id}"),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Comment,
                        contentDescription = "댓글",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(18.dp)
                    )
                    Text(
                        text = "참견하기",
                        style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium),
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

@Composable
fun StepSection(
    title: String,
    content: String,
    highlight: Boolean = false
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Text(
            text = title,
            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
            color = if (highlight) RedPenPrimary else MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = content,
            style = MaterialTheme.typography.bodyMedium.copy(
                lineHeight = 18.sp,
                fontWeight = if (highlight) FontWeight.SemiBold else FontWeight.Normal
            ),
            color = if (highlight) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.9f)
        )
    }
}

@Composable
fun NotebookPaperContainer(
    content: @Composable () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.15f), RoundedCornerShape(16.dp))
            .drawBehind {
                // Draw light notebook horizontal lines
                val lineSpacing = 40f
                var y = lineSpacing
                while (y < size.height) {
                    drawLine(
                        color = Color(0xFFCAC4D0).copy(alpha = 0.2f),
                        start = Offset(0f, y),
                        end = Offset(size.width, y),
                        strokeWidth = 1f
                    )
                    y += lineSpacing
                }

                // Draw notebook red margin line on the left side
                drawLine(
                    color = RedPenPrimary.copy(alpha = 0.25f),
                    start = Offset(60f, 0f),
                    end = Offset(60f, size.height),
                    strokeWidth = 2f
                )
            }
            .padding(start = 24.dp) // Offset content so it aligns past the red margin line
    ) {
        content()
    }
}

@Composable
fun ActionButton(
    icon: ImageVector,
    count: Int,
    label: String,
    isActive: Boolean,
    activeColor: Color,
    inactiveColor: Color,
    onClick: () -> Unit,
    tag: String
) {
    val tintColor by animateColorAsState(targetValue = if (isActive) activeColor else inactiveColor)

    Row(
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .clickable { onClick() }
            .padding(horizontal = 8.dp, vertical = 6.dp)
            .testTag(tag),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            tint = tintColor,
            modifier = Modifier.size(18.dp)
        )
        Text(
            text = "$label $count",
            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium),
            color = tintColor
        )
    }
}

@Composable
fun CommentItem(comment: Comment) {
    val isCoach = comment.nickname.contains("코치")
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (isCoach) RedPenContainer.copy(alpha = 0.4f) else MaterialTheme.colorScheme.surfaceVariant
        ),
        border = BorderStroke(
            1.dp,
            if (isCoach) RedPenPrimary.copy(alpha = 0.3f) else MaterialTheme.colorScheme.outline.copy(alpha = 0.2f)
        ),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier.padding(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = comment.nickname,
                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                    color = if (isCoach) RedPenPrimary else GoldAccent
                )
                Text(
                    text = "참견",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = comment.text,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface
            )
        }
    }
}

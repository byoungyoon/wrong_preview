package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
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
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.model.OhdabPost
import com.example.ui.theme.*
import com.example.ui.viewmodel.OhdabViewModel

data class BadgeData(
    val name: String,
    val desc: String,
    val icon: String,
    val isUnlocked: Boolean
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MyScreen(
    viewModel: OhdabViewModel,
    modifier: Modifier = Modifier
) {
    val userPosts by viewModel.userPosts.collectAsStateWithLifecycle()
    val notifications by viewModel.notifications.collectAsStateWithLifecycle()
    val voteCount by viewModel.voteCount.collectAsStateWithLifecycle()
    val commentCount by viewModel.commentCount.collectAsStateWithLifecycle()

    var selectedPostForCard by remember { mutableStateOf<OhdabPost?>(null) }

    // Calculate Karma points dynamically
    // Post: 100pts, Comment: 50pts, Vote: 20pts
    val karmaPoints = (userPosts.size * 100) + (commentCount * 50) + (voteCount * 20)

    val levelTitle = when {
        karmaPoints < 100 -> "뉴비 오답러 👶"
        karmaPoints < 300 -> "연애 분석생 📝"
        karmaPoints < 600 -> "프로 공감러 💖"
        else -> "연애 오답 코치 🎓"
    }

    // Badges definitions
    val badges = listOf(
        BadgeData("첫 발걸음", "첫 오답노트 작성", "📝", userPosts.isNotEmpty()),
        BadgeData("정답 판독기", "3회 이상 투표 참여", "🔴", voteCount >= 3),
        BadgeData("프로 공감러", "5회 이상 투표 참여", "💖", voteCount >= 5),
        BadgeData("마당발 참견러", "댓글 1회 이상 작성", "💬", commentCount >= 1),
        BadgeData("핵인싸 코치", "총 카르마 300점 돌파", "🎓", karmaPoints >= 300)
    )

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .testTag("my_screen_container"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        // 1. Profile Dashboard
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.15f), RoundedCornerShape(24.dp)),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        // Avatar
                        Box(
                            modifier = Modifier
                                .size(64.dp)
                                .background(GoldAccent.copy(alpha = 0.15f), CircleShape)
                                .border(2.dp, GoldAccent, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = "👑", fontSize = 32.sp)
                        }

                        Spacer(modifier = Modifier.width(16.dp))

                        Column {
                            Text(
                                text = "내 연애 지수 및 배지",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Text(
                                text = levelTitle,
                                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .background(GoldAccent.copy(alpha = 0.12f), RoundedCornerShape(8.dp))
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text(
                                        text = "카르마 점수: ${karmaPoints}P",
                                        style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                                        color = GoldAccent
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                    HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f))
                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = "🏆 내가 획득한 디지털 배지",
                        style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurface,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )

                    // Horizontal badges scroll
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        items(badges) { badge ->
                            BadgeItem(badge = badge)
                        }
                    }
                }
            }
        }

        // 2. Notification Center
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.15f), RoundedCornerShape(24.dp)),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Notifications,
                                contentDescription = null,
                                tint = RedPenPrimary,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "🔔 실시간 공감 및 알림 피드",
                                style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold),
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }

                        if (notifications.isNotEmpty()) {
                            Text(
                                text = "전체 삭제",
                                style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold),
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier
                                    .clickable { viewModel.clearNotifications() }
                                    .padding(4.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    if (notifications.isEmpty()) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 16.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "도착한 알림이 없습니다. 사연을 작성하거나 투표하면 여기에 실시간 피드백이 전송됩니다!",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                textAlign = TextAlign.Center
                            )
                        }
                    } else {
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            notifications.forEach { notif ->
                                NotificationRow(notification = notif)
                            }
                        }
                    }
                }
            }
        }

        // 3. User's Written Notes
        item {
            Text(
                text = "📁 내가 등록한 연애 오답노트 (${userPosts.size})",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.padding(bottom = 4.dp)
            )
        }

        if (userPosts.isEmpty()) {
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.15f), RoundedCornerShape(24.dp)),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                imageVector = Icons.Default.PostAdd,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "아직 작성된 오답노트가 없습니다.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
        } else {
            items(userPosts, key = { it.id }) { post ->
                MyPostRow(
                    post = post,
                    onClick = { selectedPostForCard = post }
                )
            }
        }
    }

    // "Ohdab Grading Card" Dialog (오답 채점 카드 팝업)
    if (selectedPostForCard != null) {
        GradingCardDialog(
            post = selectedPostForCard!!,
            onDismiss = { selectedPostForCard = null }
        )
    }
}

@Composable
fun BadgeItem(badge: BadgeData) {
    Card(
        modifier = Modifier
            .width(96.dp)
            .height(110.dp)
            .border(
                width = 1.dp,
                color = if (badge.isUnlocked) GoldAccent.copy(alpha = 0.5f) else MaterialTheme.colorScheme.outline.copy(alpha = 0.15f),
                shape = RoundedCornerShape(12.dp)
            ),
        colors = CardDefaults.cardColors(
            containerColor = if (badge.isUnlocked) MaterialTheme.colorScheme.surfaceVariant else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(
                        color = if (badge.isUnlocked) GoldAccent.copy(alpha = 0.15f) else Color.Transparent,
                        shape = CircleShape
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = badge.icon,
                    fontSize = 20.sp,
                    modifier = Modifier.align(Alignment.Center),
                    color = if (badge.isUnlocked) Color.Unspecified else Color.Gray
                )
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = badge.name,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = if (badge.isUnlocked) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
            )
            Text(
                text = badge.desc,
                fontSize = 8.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center,
                lineHeight = 10.sp
            )
        }
    }
}

@Composable
fun NotificationRow(notification: OhdabViewModel.MockNotification) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(12.dp))
            .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.15f), RoundedCornerShape(12.dp))
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(8.dp)
                .background(RedPenPrimary, CircleShape)
        )
        Spacer(modifier = Modifier.width(10.dp))
        Text(
            text = notification.message,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurface,
            modifier = Modifier.weight(1.0f)
        )
    }
}

@Composable
fun MyPostRow(
    post: OhdabPost,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.15f), RoundedCornerShape(16.dp))
            .clickable { onClick() },
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1.0f)) {
                Text(
                    text = post.hook,
                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface,
                    maxLines = 1
                )
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "투표: ${post.voteAuthorFault + post.votePartnerFault}회 참여",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Box(
                        modifier = Modifier
                            .size(3.dp)
                            .background(MaterialTheme.colorScheme.onSurfaceVariant, CircleShape)
                    )
                    Text(
                        text = "공감: ${post.sympathyCount}",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            Box(
                modifier = Modifier
                    .background(RedPenPrimary.copy(alpha = 0.15f), RoundedCornerShape(8.dp))
                    .padding(horizontal = 10.dp, vertical = 6.dp)
            ) {
                Text(
                    text = "채점 카드 🔴",
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                    color = RedPenPrimary
                )
            }
        }
    }
}

@Composable
fun GradingCardDialog(
    post: OhdabPost,
    onDismiss: () -> Unit
) {
    val totalVotes = post.voteAuthorFault + post.votePartnerFault
    val partnerFaultPercent = if (totalVotes > 0) (post.votePartnerFault * 100 / totalVotes) else 0
    val authorFaultPercent = if (totalVotes > 0) (post.voteAuthorFault * 100 / totalVotes) else 0

    val verdictGrade = when {
        partnerFaultPercent >= 90 -> "F -"
        partnerFaultPercent >= 70 -> "D"
        partnerFaultPercent >= 50 -> "C"
        else -> "B +"
    }

    val verdictText = when {
        partnerFaultPercent >= 90 -> "상대방의 과실이 90% 이상인 '우주급 오답'으로 최종 채점되었습니다. 인연 탈출이 강력 권장되는 등급입니다."
        partnerFaultPercent >= 70 -> "상대방 과실 70% 돌파! 상대의 심각한 결함이 있는 불합격 연애 사례로 채점되었습니다."
        partnerFaultPercent >= 50 -> "쌍방 과실 존! 애매모호한 과실 비율이므로 서로 오답 노트를 돌려봐야 합니다."
        else -> "내가 자책할 부분이 있는 '나의 자가 오답' 성향이 크다고 채점되었습니다."
    }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .wrapContentHeight()
                .border(2.dp, Color(0xFFEF4444), RoundedCornerShape(16.dp)),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFFEFDF0)), // Test-paper yellow cream background
            shape = RoundedCornerShape(16.dp)
        ) {
            Box(modifier = Modifier.fillMaxWidth()) {
                // Background red graded checkmark drawing
                Canvas(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(380.dp)
                ) {
                    // Big red checkmark
                    drawArc(
                        color = Color(0xFFEF4444).copy(alpha = 0.08f),
                        startAngle = 135f,
                        sweepAngle = 180f,
                        useCenter = false,
                        topLeft = Offset(size.width * 0.15f, size.height * 0.2f),
                        size = androidx.compose.ui.geometry.Size(300f, 300f),
                        style = Stroke(width = 30f)
                    )
                }

                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Test Paper Header
                    Text(
                        text = "💯 연애 오답 시험 채점표 💯",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF1E293B),
                        fontFamily = FontFamily.Monospace,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "제출자 닉네임: ${post.nickname}",
                        fontSize = 11.sp,
                        color = Color(0xFF475569),
                        fontFamily = FontFamily.Monospace
                    )

                    Spacer(modifier = Modifier.height(16.dp))
                    HorizontalDivider(color = Color(0xFFCBD5E1), thickness = 1.dp)
                    Spacer(modifier = Modifier.height(16.dp))

                    // Red Circle Stamp & Grade Side-by-Side
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1.0f)) {
                            Text(
                                text = "📌 핵심 흑역사 훅:",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFEF4444)
                            )
                            Text(
                                text = "\"${post.hook}\"",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color(0xFF1E293B),
                                lineHeight = 18.sp
                            )
                        }

                        // Circular red grade stamp
                        Box(
                            modifier = Modifier
                                .size(80.dp)
                                .border(3.dp, Color(0xFFEF4444), CircleShape)
                                .padding(4.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(
                                    text = verdictGrade,
                                    fontSize = 24.sp,
                                    fontWeight = FontWeight.Black,
                                    color = Color(0xFFEF4444)
                                )
                                Text(
                                    text = "오답 판정",
                                    fontSize = 8.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFFEF4444)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // Grading Results details
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFFF1F5F9), RoundedCornerShape(12.dp))
                            .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(12.dp))
                            .padding(14.dp)
                    ) {
                        Column {
                            Text(
                                text = "📊 최종 대중 과실 비율",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF334155)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                              ) {
                                Text("상대방 과실: $partnerFaultPercent%", fontSize = 13.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFFEF4444))
                                Text("나의 과실: $authorFaultPercent%", fontSize = 13.sp, color = Color(0xFF64748B))
                            }
                            Spacer(modifier = Modifier.height(10.dp))
                            Text(
                                text = verdictText,
                                fontSize = 11.sp,
                                lineHeight = 15.sp,
                                color = Color(0xFF475569)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // Share buttons
                    Button(
                        onClick = { /* Simulated Instagram Share */ },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("grading_share_instagram"),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFFE1306C), // Instagram color
                            contentColor = Color.White
                        ),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("인스타그램 스토리 공유하기", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.fillMaxWidth(),
                        border = BorderStroke(1.dp, Color(0xFF64748B)),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFF334155)),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("창 닫기", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

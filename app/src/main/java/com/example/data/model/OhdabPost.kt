package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "ohdab_posts")
data class OhdabPost(
    @PrimaryKey val id: String,
    val nickname: String,
    val avatarId: String,
    val tags: String, // Comma separated list of tags (e.g., "#회피형_잠수함,#가성비_집착러")
    val hook: String, // Highlighting hook
    val stepIntro: String, // 사건의 발단
    val stepClimax: String, // 클라이맥스
    val stepAction: String, // 나의 대처
    val voteAuthorFault: Int = 0, // '내가 오답이었다'
    val votePartnerFault: Int = 0, // '상대가 역대급 오답이다'
    val sympathyCount: Int = 0, // 공감 ('혈압 상승' or '토닥토닥')
    val angerCount: Int = 0, // 분노
    val timestamp: Long = System.currentTimeMillis(),
    val userVoted: Int = 0, // 0: None, 1: Author Fault, 2: Partner Fault
    val userReactedSympathy: Boolean = false,
    val userReactedAnger: Boolean = false,
    val isUserPost: Boolean = false
)

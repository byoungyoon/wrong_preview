package com.example.data.repository

import com.example.data.db.OhdabDao
import com.example.data.model.Comment
import com.example.data.model.OhdabPost
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import java.util.UUID

class OhdabRepository(private val ohdabDao: OhdabDao) {

    val allPosts: Flow<List<OhdabPost>> = ohdabDao.getAllPosts()
    val userPosts: Flow<List<OhdabPost>> = ohdabDao.getUserPosts()

    fun getCommentsForPost(postId: String): Flow<List<Comment>> =
        ohdabDao.getCommentsForPost(postId)

    suspend fun insertPost(post: OhdabPost) {
        ohdabDao.insertPost(post)
    }

    suspend fun updatePost(post: OhdabPost) {
        ohdabDao.updatePost(post)
    }

    suspend fun addComment(postId: String, text: String, commenterNickname: String) {
        val comment = Comment(
            postId = postId,
            nickname = commenterNickname,
            text = text,
            timestamp = System.currentTimeMillis()
        )
        ohdabDao.insertComment(comment)
    }

    suspend fun prepopulateIfEmpty() {
        val currentPosts = ohdabDao.getAllPosts().first()
        if (currentPosts.isEmpty()) {
            val defaultPosts = listOf(
                OhdabPost(
                    id = "ohdab_post_2026_001",
                    nickname = "서정적인_팩폭러",
                    avatarId = "avatar_crayon_red",
                    tags = "#회피형_잠수함,#눈물의_가스라이팅",
                    hook = "잠수 타고 일주일 뒤에 멀쩡히 프사 바꾼 X",
                    stepIntro = "연애한 지 200일쯤 되었을 때, 갑자기 연락이 서서히 줄어들더니 사소한 말다툼 후에 전화를 아예 안 받기 시작했어요.",
                    stepClimax = "3일 동안 사고라도 난 줄 알고 피가 마르며 걱정했는데, 일주일 뒤 카톡을 보니 제 커플링 사진은 다 내리고 지 방에서 찍은 거울 셀카로 프사가 바뀌었더라고요. 완전 황당했습니다.",
                    stepAction = "전화 50통 걸고 문자 남겼는데 카톡 차단당했어요. 내가 무슨 죽을죄를 지었나 자책하다가 친구들 위로를 듣고 겨우 제정신으로 돌아왔습니다.",
                    voteAuthorFault = 14,
                    votePartnerFault = 542,
                    sympathyCount = 320,
                    angerCount = 890,
                    timestamp = System.currentTimeMillis() - 3600000 * 24 // 1 day ago
                ),
                OhdabPost(
                    id = "ohdab_post_2026_002",
                    nickname = "매운맛_잠봉뵈르",
                    avatarId = "avatar_crayon_yellow",
                    tags = "#가성비_집착러,#소심끝판왕",
                    hook = "생일 선물로 편의점 1+1 쿠폰 보내준 내 남친",
                    stepIntro = "제 남친은 평소에도 데이트 비용을 1원 단위까지 더치페이하고 가성비 밥집만 고집했어요. 그래도 아끼는 모습이 귀엽다고 넘겼습니다.",
                    stepClimax = "드디어 대망의 제 생일날! 기대하던 고급 데이트까진 아니어도 선물은 내심 기대했는데 카톡으로 편의점 컵라면 1+1 모바일 쿠폰 한 장 보내더군요.",
                    stepAction = "웃으면서 '고마워 자기도 하나 먹어~' 했더니, '응, 어차피 1+1이니까 하나는 내 몫이지'라고 정색하며 가져가서 먹었습니다.",
                    voteAuthorFault = 5,
                    votePartnerFault = 621,
                    sympathyCount = 450,
                    angerCount = 920,
                    timestamp = System.currentTimeMillis() - 3600000 * 12 // 12 hours ago
                ),
                OhdabPost(
                    id = "ohdab_post_2026_003",
                    nickname = "환승이별_장인킬러",
                    avatarId = "avatar_crayon_blue",
                    tags = "#환승이별_장인,#눈물의_가스라이팅",
                    hook = "이별 통보 다음 날 내 친한 동기 인스타에 뜬 손",
                    stepIntro = "3년 사귄 전 남친이랑 권태기가 와서 삐걱거리던 중이었어요. 남친은 늘 '우리 사이엔 더 이상 신뢰가 없어'라며 모든 걸 제 탓으로 돌렸죠.",
                    stepClimax = "울면서 헤어지자고 카톡이 왔길래 미안해하고 있었는데, 다음 날 제 대학 동기 여사친 인스타 스토리에 커플 운동화 인증샷과 전 남친 손이 올라왔습니다. 물어보니 한 달 전부터 썸을 타던 중이더군요.",
                    stepAction = "여사친과 전 남친에게 동시에 전화를 걸었으나 '이미 지나간 일인데 왜 구질구질하게 구냐'는 가스라이팅 답변만 얻어맞고 차단당했습니다.",
                    voteAuthorFault = 2,
                    votePartnerFault = 891,
                    sympathyCount = 512,
                    angerCount = 1100,
                    timestamp = System.currentTimeMillis() - 3600000 * 2 // 2 hours ago
                )
            )
            ohdabDao.insertAllPosts(defaultPosts)

            // Populate some initial comments
            ohdabDao.insertComment(Comment(postId = "ohdab_post_2026_001", nickname = "익명 1", text = "잠수는 인성 문제입니다. 백번천번 글쓴이 잘못 없음!!"))
            ohdabDao.insertComment(Comment(postId = "ohdab_post_2026_001", nickname = "익명 2", text = "와... 프사 바꾼 건 진짜 소름이네요. 방출 축하드립니다."))
            ohdabDao.insertComment(Comment(postId = "ohdab_post_2026_001", nickname = "익명 3", text = "저도 똑같이 당해봄. 회피형은 절대로 사람 안 바뀝니다."))

            ohdabDao.insertComment(Comment(postId = "ohdab_post_2026_002", nickname = "익명 1", text = "1+1 하나는 지 몫ㅋㅋㅋㅋㅋㅋ 장난하냐 진짜ㅋㅋㅋㅋㅋㅋㅋㅋ"))
            ohdabDao.insertComment(Comment(postId = "ohdab_post_2026_002", nickname = "익명 2", text = "이런 사람도 연애를 하는데 왜 나는 솔로일까..."))

            ohdabDao.insertComment(Comment(postId = "ohdab_post_2026_003", nickname = "익명 1", text = "상대가 역대급 개쓰레기네요. 방생해주셔서 감사합니다."))
        }
    }
}

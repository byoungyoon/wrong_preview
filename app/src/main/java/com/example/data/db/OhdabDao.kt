package com.example.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.model.Comment
import com.example.data.model.OhdabPost
import kotlinx.coroutines.flow.Flow

@Dao
interface OhdabDao {
    @Query("SELECT * FROM ohdab_posts ORDER BY timestamp DESC")
    fun getAllPosts(): Flow<List<OhdabPost>>

    @Query("SELECT * FROM ohdab_posts WHERE id = :postId")
    fun getPostByIdFlow(postId: String): Flow<OhdabPost?>

    @Query("SELECT * FROM ohdab_posts WHERE id = :postId")
    suspend fun getPostById(postId: String): OhdabPost?

    @Query("SELECT * FROM ohdab_posts WHERE isUserPost = 1 ORDER BY timestamp DESC")
    fun getUserPosts(): Flow<List<OhdabPost>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPost(post: OhdabPost)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAllPosts(posts: List<OhdabPost>)

    @Update
    suspend fun updatePost(post: OhdabPost)

    @Query("SELECT * FROM comments WHERE postId = :postId ORDER BY timestamp ASC")
    fun getCommentsForPost(postId: String): Flow<List<Comment>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertComment(comment: Comment)

    @Query("DELETE FROM comments WHERE postId = :postId")
    suspend fun deleteCommentsForPost(postId: String)
}

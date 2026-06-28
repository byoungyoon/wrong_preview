package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "comments")
data class Comment(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val postId: String,
    val nickname: String, // "작성자", "익명 1", "익명 2", etc.
    val text: String,
    val timestamp: Long = System.currentTimeMillis()
)

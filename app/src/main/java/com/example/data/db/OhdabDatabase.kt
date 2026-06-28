package com.example.data.db

import androidx.room.Database
import androidx.room.RoomDatabase
import com.example.data.model.Comment
import com.example.data.model.OhdabPost

@Database(entities = [OhdabPost::class, Comment::class], version = 1, exportSchema = false)
abstract class OhdabDatabase : RoomDatabase() {
    abstract fun ohdabDao(): OhdabDao
}

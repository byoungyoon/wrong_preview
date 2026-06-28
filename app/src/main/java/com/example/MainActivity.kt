package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Create
import androidx.compose.material.icons.filled.FolderShared
import androidx.compose.material.icons.filled.Whatshot
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.ui.screens.FeedScreen
import com.example.ui.screens.MyScreen
import com.example.ui.screens.WriteScreen
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.viewmodel.OhdabViewModel
import kotlinx.coroutines.flow.collectLatest

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContent {
      MyApplicationTheme {
        val viewModel: OhdabViewModel = viewModel()
        val snackbarHostState = remember { SnackbarHostState() }
        var selectedTab by remember { mutableStateOf(0) }

        // Observe events from ViewModel
        LaunchedEffect(key1 = true) {
          viewModel.eventFlow.collectLatest { event ->
            when (event) {
              is OhdabViewModel.UiEvent.ShowSnackbar -> {
                snackbarHostState.showSnackbar(
                  message = event.message,
                  duration = SnackbarDuration.Short
                )
              }
              is OhdabViewModel.UiEvent.PostCreated -> {
                // Switch back to Feed tab on post creation
                selectedTab = 0
              }
            }
          }
        }

        Scaffold(
          modifier = Modifier.fillMaxSize(),
          snackbarHost = { SnackbarHost(hostState = snackbarHostState) },
          bottomBar = {
            NavigationBar(
              containerColor = MaterialTheme.colorScheme.surface,
              contentColor = MaterialTheme.colorScheme.onSurface,
              modifier = Modifier.testTag("bottom_nav_bar")
            ) {
              NavigationBarItem(
                selected = selectedTab == 0,
                onClick = { selectedTab = 0 },
                icon = { Icon(imageVector = Icons.Default.Whatshot, contentDescription = "오답 피드") },
                label = { Text("오답 피드", fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                modifier = Modifier.testTag("nav_tab_feed")
              )
              NavigationBarItem(
                selected = selectedTab == 1,
                onClick = { selectedTab = 1 },
                icon = { Icon(imageVector = Icons.Default.Create, contentDescription = "노트 작성") },
                label = { Text("노트 작성", fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                modifier = Modifier.testTag("nav_tab_write")
              )
              NavigationBarItem(
                selected = selectedTab == 2,
                onClick = { selectedTab = 2 },
                icon = { Icon(imageVector = Icons.Default.FolderShared, contentDescription = "내 정보") },
                label = { Text("내 정보", fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                modifier = Modifier.testTag("nav_tab_my")
              )
            }
          }
        ) { innerPadding ->
          val contentModifier = Modifier.padding(innerPadding)
          when (selectedTab) {
            0 -> FeedScreen(viewModel = viewModel, modifier = contentModifier)
            1 -> WriteScreen(viewModel = viewModel, modifier = contentModifier)
            2 -> MyScreen(viewModel = viewModel, modifier = contentModifier)
          }
        }
      }
    }
  }
}

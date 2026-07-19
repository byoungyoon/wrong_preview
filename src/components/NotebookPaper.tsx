import React from 'react';
import { View, StyleSheet } from 'react-native';

export const NotebookPaper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const lineCount = 25; // Pre-render up to 25 lines to cover longer text
  const lines = Array.from({ length: lineCount });

  return (
    <View style={styles.container}>
      {/* Lined Notebook Paper Background */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {lines.map((_, i) => (
          <View
            key={i}
            style={[
              styles.line,
              { top: 22 + i * 28 }, // Repeated vertical lines
            ]}
          />
        ))}
        {/* Red Vertical Margin line */}
        <View style={styles.marginLine} />
      </View>

      {/* Content Container */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7F2FA', // Soft pastel violet surface
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(202, 196, 208, 0.3)',
    paddingLeft: 32, // Offset to align past the red margin line
    paddingRight: 12,
    paddingVertical: 12,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 180,
  },
  line: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(202, 196, 208, 0.25)',
  },
  marginLine: {
    position: 'absolute',
    left: 22,
    top: 0,
    bottom: 0,
    width: 1.5,
    backgroundColor: 'rgba(244, 63, 94, 0.3)', // RedPenPrimary
  },
  content: {
    zIndex: 1,
  },
});
export default NotebookPaper;

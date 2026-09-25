import 'package:flutter/material.dart';

class AppTheme {
  static const verde = Color(0xFF10B981);
  static const verdeEscuro = Color(0xFF078A5B);
  static const azul = Color(0xFF176A7A);
  static const fundo = Color(0xFFF3F2F8);
  static const texto = Color(0xFF172033);
  static const cinza = Color(0xFF7B8190);
  static const vermelho = Color(0xFFEF4444);

  static ThemeData tema() {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: fundo,
      colorScheme: ColorScheme.fromSeed(seedColor: verde),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        foregroundColor: texto,
        elevation: 0,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE2E5EA)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFE2E5EA)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: verde, width: 1.5),
        ),
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: verde,
          foregroundColor: Colors.white,
          minimumSize: const Size.fromHeight(48),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      ),
    );
  }
}

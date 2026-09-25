import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class ApiException implements Exception {
  final String mensagem;
  const ApiException(this.mensagem);
  @override
  String toString() => mensagem;
}

class ApiService {
  String get baseUrl {
    if (kIsWeb) return 'http://localhost:3000';
    if (defaultTargetPlatform == TargetPlatform.android) return 'http://10.0.2.2:3000';
    return 'http://localhost:3000';
  }

  Future<dynamic> get(String rota) => _enviar('GET', rota);

  Future<dynamic> post(String rota, Map<String, dynamic> corpo) => _enviar('POST', rota, corpo);

  Future<dynamic> put(String rota, Map<String, dynamic> corpo) => _enviar('PUT', rota, corpo);

  Future<dynamic> delete(String rota) => _enviar('DELETE', rota);

  Future<dynamic> _enviar(String metodo, String rota, [Map<String, dynamic>? corpo]) async {
    try {
      final url = Uri.parse('$baseUrl$rota');
      late http.Response resposta;
      final headers = {'Content-Type': 'application/json'};

      if (metodo == 'GET') {
        resposta = await http.get(url, headers: headers);
      } else if (metodo == 'POST') {
        resposta = await http.post(url, headers: headers, body: jsonEncode(corpo));
      } else if (metodo == 'PUT') {
        resposta = await http.put(url, headers: headers, body: jsonEncode(corpo));
      } else {
        resposta = await http.delete(url, headers: headers);
      }

      dynamic dados;
      if (resposta.body.isNotEmpty) {
        try {
          dados = jsonDecode(resposta.body);
        } catch (_) {
          dados = resposta.body;
        }
      }

      if (resposta.statusCode < 200 || resposta.statusCode >= 300) {
        if (dados is Map && dados['erro'] != null) {
          throw ApiException(dados['erro'].toString());
        }
        throw ApiException('Erro ${resposta.statusCode}');
      }

      return dados;
    } catch (e) {
      if (e is ApiException) rethrow;
      throw const ApiException('Não foi possível conectar ao servidor.');
    }
  }
}

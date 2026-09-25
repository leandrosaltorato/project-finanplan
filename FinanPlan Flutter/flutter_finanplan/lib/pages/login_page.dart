import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';
import '../theme/app_theme.dart';
import 'cadastro_page.dart';
import 'shell_page.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});
  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final email = TextEditingController();
  final senha = TextEditingController();
  final auth = AuthService();
  bool carregando = false;
  bool mostrarSenha = false;

  @override
  void dispose() {
    email.dispose();
    senha.dispose();
    super.dispose();
  }

  Future<void> entrar() async {
    if (email.text.trim().isEmpty || senha.text.isEmpty) {
      mensagem('Preencha o e-mail e a senha.');
      return;
    }
    setState(() => carregando = true);
    try {
      await auth.login(email.text.trim(), senha.text);
      if (!mounted) return;
      Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const ShellPage()));
    } on ApiException catch (e) {
      mensagem(e.mensagem);
    } finally {
      if (mounted) setState(() => carregando = false);
    }
  }

  void mensagem(String texto) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(texto)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF155E63), Color(0xFF1F647B)],
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Container(
                padding: const EdgeInsets.all(30),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(.12),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(.16)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text('FinanPlan', textAlign: TextAlign.center, style: TextStyle(color: Colors.white, fontSize: 30, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    const Text('Controle suas finanças de forma simples', textAlign: TextAlign.center, style: TextStyle(color: Colors.white70)),
                    const SizedBox(height: 28),
                    TextField(
                      controller: email,
                      keyboardType: TextInputType.emailAddress,
                      style: const TextStyle(color: Colors.white),
                      decoration: _decoration('E-mail', Icons.email_outlined),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: senha,
                      obscureText: !mostrarSenha,
                      style: const TextStyle(color: Colors.white),
                      decoration: _decoration('Senha', Icons.lock_outline).copyWith(
                        suffixIcon: IconButton(
                          onPressed: () => setState(() => mostrarSenha = !mostrarSenha),
                          icon: Icon(mostrarSenha ? Icons.visibility_off : Icons.visibility, color: Colors.white70),
                        ),
                      ),
                    ),
                    const SizedBox(height: 18),
                    FilledButton(
                      onPressed: carregando ? null : entrar,
                      style: FilledButton.styleFrom(backgroundColor: Colors.white, foregroundColor: Colors.black),
                      child: carregando ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('Entrar'),
                    ),
                    const SizedBox(height: 16),
                    const Row(children: [Expanded(child: Divider(color: Colors.white30)), Padding(padding: EdgeInsets.symmetric(horizontal: 10), child: Text('OU', style: TextStyle(color: Colors.white70))), Expanded(child: Divider(color: Colors.white30))]),
                    const SizedBox(height: 16),
                    OutlinedButton.icon(
                      onPressed: null,
                      icon: const Icon(Icons.g_mobiledata, color: Colors.white),
                      label: const Text('Continuar com Google'),
                    ),
                    const SizedBox(height: 20),
                    TextButton(
                      onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CadastroPage())),
                      child: const Text('Ainda não possui uma conta? Criar conta', style: TextStyle(color: Colors.white)),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  InputDecoration _decoration(String label, IconData icon) {
    return InputDecoration(
      hintText: label,
      hintStyle: const TextStyle(color: Colors.white70),
      prefixIcon: Icon(icon, color: Colors.white70),
      filled: true,
      fillColor: Colors.white.withOpacity(.12),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
    );
  }
}

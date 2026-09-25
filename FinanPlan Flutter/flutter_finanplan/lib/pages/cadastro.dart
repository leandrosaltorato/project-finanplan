import 'package:flutter/material.dart';

import '../services/api_service.dart';
import '../theme/colors.dart';

class CadastroPage extends StatefulWidget {
  const CadastroPage({super.key});

  @override
  State<CadastroPage> createState() => _CadastroPageState();
}

class _CadastroPageState extends State<CadastroPage> {
  final _formKey = GlobalKey<FormState>();

  final _nomeController = TextEditingController();
  final _emailController = TextEditingController();
  final _senhaController = TextEditingController();
  final _confirmarSenhaController = TextEditingController();

  bool _mostrarSenha = false;
  bool _mostrarConfirmacao = false;
  bool _carregando = false;

  @override
  void dispose() {
    _nomeController.dispose();
    _emailController.dispose();
    _senhaController.dispose();
    _confirmarSenhaController.dispose();

    super.dispose();
  }

  Future<void> _cadastrar() async {
    FocusScope.of(context).unfocus();

    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _carregando = true;
    });

    try {
      await ApiService.cadastrar(
        nome: _nomeController.text.trim(),
        email: _emailController.text.trim(),
        senha: _senhaController.text,
      );

      if (!mounted) {
        return;
      }

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Cadastro realizado com sucesso!'),
          behavior: SnackBarBehavior.floating,
        ),
      );

      Navigator.of(context).pop();
    } on ApiException catch (erro) {
      _mostrarMensagem(erro.message);
    } catch (erro) {
      debugPrint('Erro no cadastro: $erro');

      _mostrarMensagem('Não foi possível conectar ao servidor.');
    } finally {
      if (mounted) {
        setState(() {
          _carregando = false;
        });
      }
    }
  }

  void _mostrarMensagem(String mensagem) {
    if (!mounted) {
      return;
    }

    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(content: Text(mensagem), behavior: SnackBarBehavior.floating),
      );
  }

  InputDecoration _inputDecoration({
    required String hint,
    required IconData icon,
    Widget? suffixIcon,
  }) {
    return InputDecoration(
      hintText: hint,
      prefixIcon: Icon(icon, size: 20, color: AppColors.textSecondary),
      suffixIcon: suffixIcon,
      filled: true,
      fillColor: AppColors.background,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppColors.green, width: 1.4),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.white,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          onPressed: () {
            Navigator.of(context).pop();
          },
          icon: const Icon(Icons.arrow_back_rounded, color: AppColors.text),
        ),
        title: const Text(
          'Criar conta',
          style: TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w800,
            color: AppColors.text,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(22, 18, 22, 30),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 430),
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 24,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Center(
                        child: Image.asset(
                          'assets/logopjtsreal.png',
                          width: 125,
                          fit: BoxFit.contain,
                        ),
                      ),

                      const SizedBox(height: 24),

                      const Text(
                        'Crie sua conta',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                          color: AppColors.text,
                        ),
                      ),

                      const SizedBox(height: 6),

                      const Text(
                        'Preencha seus dados para começar.',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),

                      const SizedBox(height: 24),

                      const Text(
                        'Nome',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppColors.text,
                        ),
                      ),

                      const SizedBox(height: 7),

                      TextFormField(
                        controller: _nomeController,
                        textCapitalization: TextCapitalization.words,
                        textInputAction: TextInputAction.next,
                        decoration: _inputDecoration(
                          hint: 'Digite seu nome',
                          icon: Icons.person_outline_rounded,
                        ),
                        validator: (valor) {
                          if (valor == null || valor.trim().isEmpty) {
                            return 'Digite seu nome.';
                          }

                          if (valor.trim().length < 2) {
                            return 'Digite um nome válido.';
                          }

                          return null;
                        },
                      ),

                      const SizedBox(height: 16),

                      const Text(
                        'E-mail',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppColors.text,
                        ),
                      ),

                      const SizedBox(height: 7),

                      TextFormField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        textInputAction: TextInputAction.next,
                        decoration: _inputDecoration(
                          hint: 'Digite seu e-mail',
                          icon: Icons.email_outlined,
                        ),
                        validator: (valor) {
                          if (valor == null || valor.trim().isEmpty) {
                            return 'Digite seu e-mail.';
                          }

                          if (!valor.contains('@') || !valor.contains('.')) {
                            return 'Digite um e-mail válido.';
                          }

                          return null;
                        },
                      ),

                      const SizedBox(height: 16),

                      const Text(
                        'Senha',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppColors.text,
                        ),
                      ),

                      const SizedBox(height: 7),

                      TextFormField(
                        controller: _senhaController,
                        obscureText: !_mostrarSenha,
                        textInputAction: TextInputAction.next,
                        decoration: _inputDecoration(
                          hint: 'Crie uma senha',
                          icon: Icons.lock_outline_rounded,
                          suffixIcon: IconButton(
                            onPressed: () {
                              setState(() {
                                _mostrarSenha = !_mostrarSenha;
                              });
                            },
                            icon: Icon(
                              _mostrarSenha
                                  ? Icons.visibility_off_outlined
                                  : Icons.visibility_outlined,
                              color: AppColors.textSecondary,
                              size: 20,
                            ),
                          ),
                        ),
                        validator: (valor) {
                          if (valor == null || valor.isEmpty) {
                            return 'Digite uma senha.';
                          }

                          if (valor.length < 6) {
                            return 'A senha deve ter pelo menos 6 caracteres.';
                          }

                          return null;
                        },
                      ),

                      const SizedBox(height: 16),

                      const Text(
                        'Confirmar senha',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppColors.text,
                        ),
                      ),

                      const SizedBox(height: 7),

                      TextFormField(
                        controller: _confirmarSenhaController,
                        obscureText: !_mostrarConfirmacao,
                        textInputAction: TextInputAction.done,
                        onFieldSubmitted: (_) {
                          _cadastrar();
                        },
                        decoration: _inputDecoration(
                          hint: 'Digite a senha novamente',
                          icon: Icons.lock_reset_outlined,
                          suffixIcon: IconButton(
                            onPressed: () {
                              setState(() {
                                _mostrarConfirmacao = !_mostrarConfirmacao;
                              });
                            },
                            icon: Icon(
                              _mostrarConfirmacao
                                  ? Icons.visibility_off_outlined
                                  : Icons.visibility_outlined,
                              color: AppColors.textSecondary,
                              size: 20,
                            ),
                          ),
                        ),
                        validator: (valor) {
                          if (valor == null || valor.isEmpty) {
                            return 'Confirme sua senha.';
                          }

                          if (valor != _senhaController.text) {
                            return 'As senhas não coincidem.';
                          }

                          return null;
                        },
                      ),

                      const SizedBox(height: 24),

                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: FilledButton(
                          onPressed: _carregando ? null : _cadastrar,
                          style: FilledButton.styleFrom(
                            backgroundColor: AppColors.green,
                            disabledBackgroundColor: AppColors.green
                                .withOpacity(0.55),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: _carregando
                              ? const SizedBox(
                                  width: 22,
                                  height: 22,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2.2,
                                    color: Colors.white,
                                  ),
                                )
                              : const Text(
                                  'Criar conta',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                        ),
                      ),

                      const SizedBox(height: 16),

                      Center(
                        child: GestureDetector(
                          onTap: () {
                            Navigator.of(context).pop();
                          },
                          child: const Text(
                            'Já tenho uma conta',
                            style: TextStyle(
                              fontSize: 11,
                              color: AppColors.greenDark,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

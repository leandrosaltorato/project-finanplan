import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class ConfiguracoesPage extends StatefulWidget {
  const ConfiguracoesPage({super.key});
  @override
  State<ConfiguracoesPage> createState() => _ConfiguracoesPageState();
}

class _ConfiguracoesPageState extends State<ConfiguracoesPage> {
  String moeda = 'Real (R\$)';
  String idioma = 'Português (BR)';
  bool escuro = false;
  bool email = true;
  bool alertas = true;

  void mensagem(String texto) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(texto)));
  }

  @override
  Widget build(BuildContext context) {
    return ListView(padding: const EdgeInsets.all(18), children: [
      const Text('Configurações', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w700)),
      const SizedBox(height: 4),
      const Text('Gerencie suas preferências', style: TextStyle(color: AppTheme.cinza)),
      const SizedBox(height: 18),
      Card(child: Padding(padding: const EdgeInsets.all(20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Preferências', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
        const SizedBox(height: 16),
        DropdownButtonFormField<String>(value: moeda, items: const [DropdownMenuItem(value: 'Real (R\$)', child: Text('Real (R\$)')), DropdownMenuItem(value: 'Dólar (US\$)', child: Text('Dólar (US\$)')), DropdownMenuItem(value: 'Euro (€)', child: Text('Euro (€)'))], onChanged: (v) => setState(() => moeda = v!), decoration: const InputDecoration(labelText: 'Moeda')),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(value: idioma, items: const [DropdownMenuItem(value: 'Português (BR)', child: Text('Português (BR)')), DropdownMenuItem(value: 'English', child: Text('English')), DropdownMenuItem(value: 'Español', child: Text('Español'))], onChanged: (v) => setState(() => idioma = v!), decoration: const InputDecoration(labelText: 'Idioma')),
        SwitchListTile(title: const Text('Modo escuro'), subtitle: const Text('Ativar tema escuro'), value: escuro, onChanged: (v) => setState(() => escuro = v)),
        SwitchListTile(title: const Text('Notificações por e-mail'), subtitle: const Text('Receber resumo semanal'), value: email, onChanged: (v) => setState(() => email = v)),
        SwitchListTile(title: const Text('Alertas de meta'), subtitle: const Text('Avisar sobre metas'), value: alertas, onChanged: (v) => setState(() => alertas = v)),
        FilledButton(onPressed: () => mensagem('Preferências salvas.'), child: const Text('Salvar')),
      ]))),
    ]);
  }
}

import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class MetaItem {
  final String titulo;
  final String descricao;
  final double atual;
  final double total;
  final IconData icon;

  const MetaItem(this.titulo, this.descricao, this.atual, this.total, this.icon);
}

class MetasPage extends StatelessWidget {
  const MetasPage({super.key});

  String moeda(double valor) => 'R\$ ${valor.toStringAsFixed(2).replaceAll('.', ',')}';

  @override
  Widget build(BuildContext context) {
    const metas = [
      MetaItem('Reserva de Emergência', '111 dias restantes', 18500, 30000, Icons.shield),
      MetaItem('Viagem Europa', '263 dias restantes', 6200, 15000, Icons.flight),
      MetaItem('MacBook Pro', '0 dias restantes', 8400, 12000, Icons.laptop_mac),
      MetaItem('Entrada Apartamento', '477 dias restantes', 22000, 80000, Icons.home),
    ];
    final economizado = metas.fold<double>(0, (s, m) => s + m.atual);
    final total = metas.fold<double>(0, (s, m) => s + m.total);

    return ListView(padding: const EdgeInsets.all(18), children: [
      const Text('Metas Financeiras', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w700)),
      const SizedBox(height: 4),
      const Text('Acompanhe seus objetivos de economia', style: TextStyle(color: AppTheme.cinza)),
      const SizedBox(height: 18),
      Wrap(spacing: 14, runSpacing: 14, children: [
        _resumo('Total Economizado', moeda(economizado), 'de ${moeda(total)}'),
        _resumo('Metas Ativas', metas.length.toString(), ''),
        _resumo('Concluídas', '0', ''),
      ]),
      const SizedBox(height: 18),
      ...metas.map((meta) => _meta(meta)),
    ]);
  }

  Widget _resumo(String titulo, String valor, String sub) {
    return SizedBox(width: 300, child: Card(child: Padding(padding: const EdgeInsets.all(18), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(titulo, style: const TextStyle(color: AppTheme.cinza)), const SizedBox(height: 6), Text(valor, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700)), if (sub.isNotEmpty) Text(sub, style: const TextStyle(color: AppTheme.cinza))])));
  }

  Widget _meta(MetaItem meta) {
    final progresso = (meta.atual / meta.total).clamp(0, 1).toDouble();
    return Card(margin: const EdgeInsets.only(bottom: 14), child: Padding(padding: const EdgeInsets.all(18), child: Column(children: [
      Row(children: [CircleAvatar(backgroundColor: AppTheme.azul.withOpacity(.1), child: Icon(meta.icon, color: AppTheme.azul)), const SizedBox(width: 12), Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(meta.titulo, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)), Text(meta.descricao, style: const TextStyle(color: AppTheme.cinza))]))]),
      const SizedBox(height: 14),
      Row(children: [Text(moeda(meta.atual), style: const TextStyle(fontWeight: FontWeight.w700)), const Spacer(), Text(moeda(meta.total), style: const TextStyle(color: AppTheme.cinza))]),
      const SizedBox(height: 8),
      LinearProgressIndicator(value: progresso, minHeight: 9, borderRadius: BorderRadius.circular(10)),
      const SizedBox(height: 8),
      Align(alignment: Alignment.centerRight, child: Text('${(progresso * 100).round()}%')),
    ])));
  }
}

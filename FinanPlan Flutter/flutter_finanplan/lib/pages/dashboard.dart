import 'package:flutter/material.dart';

import '../theme/colors.dart';

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 30),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Dashboard',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w800,
              color: AppColors.text,
            ),
          ),
          const SizedBox(height: 3),
          const Text(
            'Visão geral das suas finanças',
            style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 18),
          Row(
            children: [
              Expanded(
                child: _SummaryCard(
                  title: 'Saldo Total',
                  value: 'R\$ 6.820',
                  footer: '+12% mês anterior',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _SummaryCard(
                  title: 'Receitas',
                  value: 'R\$ 10.500',
                  footer: '+R\$ 2.000 freelance',
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _SummaryCard(
                  title: 'Despesas',
                  value: 'R\$ 3.680',
                  footer: '35% da receita',
                  footerRed: true,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _SummaryCard(
                  title: 'Meta de Economia',
                  value: 'R\$ 2.046',
                  footer: '30% do saldo',
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.fromLTRB(12, 18, 12, 12),
            decoration: BoxDecoration(
              color: AppColors.white,
              borderRadius: BorderRadius.circular(13),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(
                  padding: EdgeInsets.only(left: 2, right: 2, bottom: 13),
                  child: Text(
                    'Transações Recentes',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppColors.text,
                    ),
                  ),
                ),
                const _Transaction(
                  title: 'Salário',
                  subtitle: 'Salário · 01 de mar.',
                  value: '+ R\$ 8.500',
                  income: true,
                  icon: Icons.arrow_upward_rounded,
                ),
                const _Transaction(
                  title: 'Aluguel',
                  subtitle: 'Moradia · 02 de mar.',
                  value: '- R\$ 2.200',
                  icon: Icons.arrow_downward_rounded,
                ),
                const _Transaction(
                  title: 'Supermercado',
                  subtitle: 'Alimentação · 03 de mar.',
                  value: '- R\$ 650',
                  icon: Icons.arrow_downward_rounded,
                ),
                const _Transaction(
                  title: 'Uber',
                  subtitle: 'Transporte · 03 de mar.',
                  value: '- R\$ 120',
                  icon: Icons.arrow_downward_rounded,
                ),
                const _Transaction(
                  title: 'Netflix + Spotify',
                  subtitle: 'Lazer · 04 de mar.',
                  value: '- R\$ 75',
                  icon: Icons.arrow_downward_rounded,
                  last: true,
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
        ],
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final String title;
  final String value;
  final String footer;
  final bool footerRed;

  const _SummaryCard({
    required this.title,
    required this.value,
    required this.footer,
    this.footerRed = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 112,
      padding: const EdgeInsets.fromLTRB(14, 14, 10, 12),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF299E6B), Color(0xFF216E7D)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 10,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
          const Spacer(),
          Text(
            footer,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: footerRed
                  ? const Color(0xFFFF6B6B)
                  : Colors.white.withOpacity(0.65),
              fontSize: 9,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _Transaction extends StatelessWidget {
  final String title;
  final String subtitle;
  final String value;
  final IconData icon;
  final bool income;
  final bool last;

  const _Transaction({
    required this.title,
    required this.subtitle,
    required this.value,
    required this.icon,
    this.income = false,
    this.last = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 60,
      margin: EdgeInsets.only(bottom: last ? 0 : 8),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF11B982), Color(0xFF216D7B)],
        ),
        borderRadius: BorderRadius.circular(9),
      ),
      child: Row(
        children: [
          const SizedBox(width: 12),
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.12),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              icon,
              color: income ? const Color(0xFF00E17C) : const Color(0xFFFF4D4D),
              size: 19,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  subtitle,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.70),
                    fontSize: 9,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              value,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.right,
              style: TextStyle(
                color: income
                    ? const Color(0xFF00E17C)
                    : const Color(0xFFFF5050),
                fontSize: 10,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
          const SizedBox(width: 12),
        ],
      ),
    );
  }
}

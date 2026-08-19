import 'package:flutter/material.dart';

import '../theme/colors.dart';

class TransactionsPage extends StatelessWidget {
  const TransactionsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 30),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // =====================================================
          // CABEÇALHO
          // =====================================================
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Transações',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                        color: AppColors.text,
                      ),
                    ),
                    SizedBox(height: 3),
                    Text(
                      'Gerencie suas movimentações financeiras',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 11,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(width: 10),

              // Botão nova transação
              Material(
                color: AppColors.green,
                borderRadius: BorderRadius.circular(9),
                child: InkWell(
                  borderRadius: BorderRadius.circular(9),
                  onTap: () {},
                  child: const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 12, vertical: 11),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.add, color: Colors.white, size: 17),
                        SizedBox(width: 4),
                        Text(
                          'Nova',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 18),

          // =====================================================
          // CARDS 2 x 2
          // =====================================================
          Row(
            children: [
              Expanded(
                child: _InfoCard(
                  icon: Icons.arrow_upward_rounded,
                  title: 'Receitas',
                  value: 'R\$ 11.500',
                  subtitle: '+R\$ 2.000',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _InfoCard(
                  icon: Icons.arrow_downward_rounded,
                  title: 'Despesas',
                  value: 'R\$ 5.265',
                  subtitle: '46% da receita',
                ),
              ),
            ],
          ),

          const SizedBox(height: 10),

          Row(
            children: [
              Expanded(
                child: _InfoCard(
                  icon: Icons.account_balance_wallet_rounded,
                  title: 'Saldo do Mês',
                  value: 'R\$ 6.235',
                  subtitle: '+12% anterior',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _InfoCard(
                  icon: Icons.receipt_long_rounded,
                  title: 'Transações',
                  value: '24',
                  subtitle: '5 receitas · 19 despesas',
                ),
              ),
            ],
          ),

          const SizedBox(height: 18),

          // =====================================================
          // FILTROS
          // =====================================================
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.white,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(child: _Filter(text: 'Março')),
                    const SizedBox(width: 8),
                    Expanded(child: _Filter(text: 'Todos os tipos')),
                  ],
                ),

                const SizedBox(height: 8),

                _Filter(text: 'Todas as categorias', fullWidth: true),

                const SizedBox(height: 10),

                // Busca
                Container(
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const TextField(
                    decoration: InputDecoration(
                      hintText: 'Buscar transação...',
                      hintStyle: TextStyle(
                        fontSize: 11,
                        color: AppColors.textSecondary,
                      ),
                      prefixIcon: Icon(
                        Icons.search,
                        size: 18,
                        color: AppColors.textSecondary,
                      ),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(vertical: 11),
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // =====================================================
          // ABAS
          // =====================================================
          Row(
            children: [
              const _Tab(text: 'Todas', selected: true),
              const SizedBox(width: 7),
              const _Tab(text: 'Receitas'),
              const SizedBox(width: 7),
              const _Tab(text: 'Despesas'),
            ],
          ),

          const SizedBox(height: 12),

          // =====================================================
          // LISTA
          // =====================================================
          const _TransactionList(),

          const SizedBox(height: 15),

          // Paginação
          Row(
            children: [
              const Text(
                'Mostrando 1–8 de 24',
                style: TextStyle(fontSize: 10, color: AppColors.textSecondary),
              ),

              const Spacer(),

              const _PageButton(text: '<'),
              const _PageButton(text: '1', selected: true),
              const _PageButton(text: '2'),
              const _PageButton(text: '3'),
              const _PageButton(text: '>'),
            ],
          ),
        ],
      ),
    );
  }
}

// ===============================================================
// CARD DE INFORMAÇÃO
// ===============================================================

class _InfoCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final String subtitle;

  const _InfoCard({
    required this.icon,
    required this.title,
    required this.value,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 108,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF11A56D), Color(0xFF087B51)],
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 30,
            height: 30,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: Colors.white, size: 17),
          ),

          const Spacer(),

          Text(
            title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: Colors.white.withOpacity(0.75),
              fontSize: 9,
              fontWeight: FontWeight.w600,
            ),
          ),

          const SizedBox(height: 2),

          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 17,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),

          Text(
            subtitle,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: Colors.white.withOpacity(0.60),
              fontSize: 8,
            ),
          ),
        ],
      ),
    );
  }
}

// ===============================================================
// FILTRO
// ===============================================================

class _Filter extends StatelessWidget {
  final String text;
  final bool fullWidth;

  const _Filter({required this.text, this.fullWidth = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: fullWidth ? double.infinity : null,
      height: 34,
      padding: const EdgeInsets.symmetric(horizontal: 11),
      decoration: BoxDecoration(
        color: const Color(0xFFE7F7F1),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFC8EBDD)),
      ),
      child: Row(
        mainAxisSize: fullWidth ? MainAxisSize.max : MainAxisSize.min,
        children: [
          const Icon(
            Icons.filter_alt_outlined,
            size: 13,
            color: AppColors.greenDark,
          ),
          const SizedBox(width: 5),

          Expanded(
            child: Text(
              text,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontSize: 10,
                color: AppColors.greenDark,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),

          const SizedBox(width: 4),

          const Icon(
            Icons.keyboard_arrow_down,
            size: 14,
            color: AppColors.greenDark,
          ),
        ],
      ),
    );
  }
}

// ===============================================================
// ABAS
// ===============================================================

class _Tab extends StatelessWidget {
  final String text;
  final bool selected;

  const _Tab({required this.text, this.selected = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: selected ? AppColors.green : AppColors.white,
        borderRadius: BorderRadius.circular(18),
        border: selected ? null : Border.all(color: AppColors.border),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w600,
          color: selected ? Colors.white : AppColors.textSecondary,
        ),
      ),
    );
  }
}

// ===============================================================
// LISTA DE TRANSAÇÕES
// ===============================================================

class _TransactionList extends StatelessWidget {
  const _TransactionList();

  @override
  Widget build(BuildContext context) {
    const transactions = [
      _TransactionData(
        title: 'Salário',
        category: 'Salário',
        date: '01 de mar.',
        method: 'TED/DOC',
        value: '+ R\$ 8.500',
        income: true,
      ),
      _TransactionData(
        title: 'Freelance Web',
        category: 'Freelance',
        date: '02 de mar.',
        method: 'PIX',
        value: '+ R\$ 2.000',
        income: true,
      ),
      _TransactionData(
        title: 'Aluguel',
        category: 'Moradia',
        date: '02 de mar.',
        method: 'TED/DOC',
        value: '- R\$ 2.200',
      ),
      _TransactionData(
        title: 'Supermercado',
        category: 'Alimentação',
        date: '03 de mar.',
        method: 'Débito',
        value: '- R\$ 650',
      ),
      _TransactionData(
        title: 'Uber',
        category: 'Transporte',
        date: '03 de mar.',
        method: 'Crédito',
        value: '- R\$ 130',
      ),
      _TransactionData(
        title: 'Netflix + Spotify',
        category: 'Assinatura',
        date: '04 de mar.',
        method: 'Crédito',
        value: '- R\$ 89',
      ),
      _TransactionData(
        title: 'Academia',
        category: 'Saúde',
        date: '05 de mar.',
        method: 'Débito',
        value: '- R\$ 120',
      ),
      _TransactionData(
        title: 'Restaurante',
        category: 'Alimentação',
        date: '07 de mar.',
        method: 'Crédito',
        value: '- R\$ 185',
      ),
    ];

    return Column(
      children: transactions.map((transaction) {
        return _TransactionCard(data: transaction);
      }).toList(),
    );
  }
}

// ===============================================================
// DADOS DA TRANSAÇÃO
// ===============================================================

class _TransactionData {
  final String title;
  final String category;
  final String date;
  final String method;
  final String value;
  final bool income;

  const _TransactionData({
    required this.title,
    required this.category,
    required this.date,
    required this.method,
    required this.value,
    this.income = false,
  });
}

// ===============================================================
// CARD DA TRANSAÇÃO
// ===============================================================

class _TransactionCard extends StatelessWidget {
  final _TransactionData data;

  const _TransactionCard({required this.data});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(11),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          // Ícone
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: data.income
                  ? AppColors.success.withOpacity(0.10)
                  : AppColors.red.withOpacity(0.08),
              borderRadius: BorderRadius.circular(9),
            ),
            child: Icon(
              data.income
                  ? Icons.arrow_upward_rounded
                  : Icons.arrow_downward_rounded,
              size: 18,
              color: data.income ? AppColors.success : AppColors.red,
            ),
          ),

          const SizedBox(width: 10),

          // Informações
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  data.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppColors.text,
                  ),
                ),

                const SizedBox(height: 3),

                Text(
                  '${data.category} · ${data.date}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 9,
                    color: AppColors.textSecondary,
                  ),
                ),

                const SizedBox(height: 2),

                Text(
                  data.method,
                  style: const TextStyle(
                    fontSize: 8,
                    color: AppColors.greenDark,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(width: 7),

          // Valor + ações
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                data.value,
                maxLines: 1,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  color: data.income ? AppColors.success : AppColors.red,
                ),
              ),

              const SizedBox(height: 5),

              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _ActionButton(icon: Icons.edit_outlined),
                  const SizedBox(width: 4),
                  _ActionButton(icon: Icons.delete_outline),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ===============================================================
// BOTÃO DE AÇÃO
// ===============================================================

class _ActionButton extends StatelessWidget {
  final IconData icon;

  const _ActionButton({required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 25,
      height: 25,
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Icon(icon, size: 13, color: AppColors.textSecondary),
    );
  }
}

// ===============================================================
// PAGINAÇÃO
// ===============================================================

class _PageButton extends StatelessWidget {
  final String text;
  final bool selected;

  const _PageButton({required this.text, this.selected = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 27,
      height: 27,
      margin: const EdgeInsets.only(left: 5),
      decoration: BoxDecoration(
        color: selected ? AppColors.green : Colors.white,
        borderRadius: BorderRadius.circular(5),
        border: Border.all(color: AppColors.border),
      ),
      alignment: Alignment.center,
      child: Text(
        text,
        style: TextStyle(
          fontSize: 9,
          fontWeight: FontWeight.w600,
          color: selected ? Colors.white : AppColors.textSecondary,
        ),
      ),
    );
  }
}

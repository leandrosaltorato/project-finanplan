class Usuario {
  final int id;
  final String nome;
  final String email;
  final String? telefone;

  const Usuario({
    required this.id,
    required this.nome,
    required this.email,
    this.telefone,
  });

  factory Usuario.fromJson(Map<String, dynamic> json) {
    return Usuario(
      id: int.tryParse('${json['id']}') ?? 0,
      nome: '${json['nome'] ?? ''}',
      email: '${json['email'] ?? ''}',
      telefone: json['Telefone']?.toString() ?? json['telefone']?.toString(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'nome': nome,
        'email': email,
        'Telefone': telefone,
      };
}

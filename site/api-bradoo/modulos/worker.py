def format_data(data):
    """
    Formata formulario recebido para dicionario.

    :param data:
    :return:
    """
    result = {}
    for x in data:
        result[x['name']] = x['value']
    return result
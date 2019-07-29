from django import forms

class JobForm(forms.Form):
    name = forms.CharField(label="Nome da Instância", max_length=50, required=True, error_messages={'required': 'Please enter your name'})
    cnpj_cpf = forms.CharField(label="CNPJ", max_length=18, required=True, error_messages={'required': 'Please enter your name'})
    nome_razaosocial = forms.CharField(label="Nome ou Razão Social", max_length=100, required=True, error_messages={'required': 'Please enter your name'})
    login = forms.CharField(label="Login (Usuário Odoo)", max_length=30, required=True, error_messages={'required': 'Please enter your name'})
    password = forms.CharField(label="Senha (Usuário Odoo)", widget=forms.PasswordInput, max_length=20, required=True, error_messages={'required': 'Please enter your name'})

class JobFormUpdate(forms.Form):
    nameu = forms.CharField(label="Name", max_length=50, required=False, error_messages={'required': 'Please enter your name'})

class ImageForm(forms.Form):
    image_tag = forms.CharField(label="Image Tag", max_length=50, required=True, error_messages={'required': 'Please enter your name'})
    image_name = forms.CharField(label="Image Name", max_length=50, required=True, error_messages={'required': 'Please enter your name'})
    url_image = forms.CharField(label="URL Image (Registry)")

class ImageFormUpdate(forms.Form):
    image_nameu = forms.CharField(label="Image Name", max_length=100, required=True, error_messages={'required': 'Please enter your name'})
    url_imageu = forms.CharField(label="URL Image", required=True, error_messages={'required': 'Please enter your name'})

class AuthForm(forms.Form):
    username = forms.CharField(label="Username", required=True, max_length=100)
    password = forms.CharField(widget=forms.PasswordInput, required=True)

class ProductForm(forms.Form):
    product = forms.CharField(label="Nome do Produto", required=True)
    domain = forms.CharField(label="Dominio do Produto", required=True)
    server = forms.CharField(label="Servidor SMTP e IMAP padrão")
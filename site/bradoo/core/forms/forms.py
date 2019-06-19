from django import forms
# from core.views.containers_views import IMAGES
# IMAGES = (('docker.io', 'docker.io'), ('gcr.io', 'gcr.io'))
# print(IMAGES)

class JobForm(forms.Form):
    name = forms.CharField(label="Nome da Instância", max_length=50, required=False, error_messages={'required': 'Please enter your name'})
   #username_odoo = forms.CharField(label="Username", required=False)
   # odoo_email = forms.EmailField(label="E-mail", required=False)
   # smtp_host = forms.URLField(label="Host smtp", initial='https://', required=False)
   # smtpuser = forms.CharField(label="User smtp", required=False)
   # smtppassword = forms.CharField(label="Password smtp", required=False)
   # passdb = forms.CharField(label="Passdb", required=False)

class JobFormUpdate(forms.Form):
    nameu = forms.CharField(label="Name", max_length=50, required=False, error_messages={'required': 'Please enter your name'})
    #username_odoou = forms.CharField(label="Username", required=False)
    #odoo_emailu = forms.EmailField(label="E-mail", required=False)
    #smtp_hostu = forms.URLField(label="Host smtp", initial='https://', required=False)
    #smtpuseru = forms.CharField(label="User smtp", required=False)
    #smtppasswordu = forms.CharField(label="Password smtp", required=False)
    #passdbu = forms.CharField(label="Passdb", required=False)

class ImageForm(forms.Form):
    url_image = forms.CharField(label="URL Image")
    image_name = forms.CharField(label="Image Name", max_length=50, required=True, error_messages={'required': 'Please enter your name'})
    image_tag = forms.CharField(label="Image Tag", max_length=50, required=True, error_messages={'required': 'Please enter your name'})
    # comments = forms.CharField(label="Produto", max_length=50, required=True, error_messages={'required': 'Add comment'})

class ImageFormUpdate(forms.Form):
    # image_tagu = forms.CharField(label="Image Tag", max_length=100, required=True, error_messages={'required': 'Please enter your name'})
    image_nameu = forms.CharField(label="Image Name", max_length=100, required=True, error_messages={'required': 'Please enter your name'})
    url_imageu = forms.CharField(label="URL Image", required=True, error_messages={'required': 'Please enter your name'})
    # commentsu = forms.CharField(label="Produto", max_length=200, required=True, error_messages={'required': 'Add comment'})

class AuthForm(forms.Form):
    username = forms.CharField(label="Username", required=True, max_length=100)
    password = forms.CharField(widget=forms.PasswordInput, required=True)


class ProductForm(forms.Form):
    product = forms.CharField(label="Nome do Produto", required=True)
    domain = forms.CharField(label="Dominio do Produto", required=True)
    server = forms.CharField(label="Servidor SMTP e IMAP padrão")

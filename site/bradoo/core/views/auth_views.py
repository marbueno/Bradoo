from django.shortcuts import render, HttpResponseRedirect
from core.forms import AuthForm
from django.contrib.auth import authenticate, login, logout

def auth_login(request):
    if request.method == "GET":
        context = {
            "form_auth": AuthForm
        }
        return render(request, 'auth/login.html', context)

    elif request.method == "POST":
        form_auth = AuthForm(request.POST)
        if form_auth.is_valid():
            username = form_auth.cleaned_data['username']
            password = form_auth.cleaned_data['password']
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return HttpResponseRedirect('/')
            else:
                context = {
                    "form_auth": AuthForm
                }
                return HttpResponseRedirect('/login/', context)


def auth_logout(request):
    logout(request)
    context = {
        "form_auth": AuthForm
    }
    return HttpResponseRedirect('/login/', context)

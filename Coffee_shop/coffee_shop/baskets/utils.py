from baskets.models import Baskets

def get_user_baskets(request):
    if request.user.is_authenticated:
        return Baskets.objects.filter(user=request.user)
     
    if not request.session.session_key:
        request.session.create()
    
    return Baskets.objects.filter(session_key=request.session.session_key) 
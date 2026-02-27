export async function refreshToken () {
    try {
       const response = await fetch('/api/refresh', {
          method: 'POST',
          credentials: 'include'
       })

        if(response.status === 401) {
           console.log("Refresh unauthorized");
           console.log(response);
            return false;
        }

        if(response.status === 403) {
           console.log("Refresh token no válido o ha expirado, el usuario tiene que iniciar sesión de nuevo");
            return false;
         }

         if (!response.ok) {
           console.log('Refresh request failed with status', response);
           return false;
         }

         return true;

    } catch (error) {
        console.error("Error al refrescar el token: ", error);
        return false;
      } 
}
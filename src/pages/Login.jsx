import {React, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import "./login.css"
import { set } from 'zod';

function Login() {

const [submitAction, setSubmitAction] = useState("login");
const [name, setName] = useState("");
const [lastname, setLastname] = useState("");
const [birthdate, setBirthdate] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [responseText, setResponseText] = useState(["", 'error'])
const navigate = useNavigate();


  async function handelSubmit (e) {
    e.preventDefault();

    if(submitAction == 'login') {

        fetch(`/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include' // para enviar las cookies al backend
        }).then(res => res.json())
        .then(data => {
            
            if(data.error) {
                setResponseText([data.error, 'error']);
                return;
            } 
            
            setResponseText([data.message, 'correcto']);

            setTimeout(()=> {
              setEmail('');
              setPassword(''); 
              navigate('/')
            },1000);
          })  
        
          .catch(error => {
            setResponseText(["Error al iniciar sesión", 'error']);
        });

  } else if(submitAction == 'registrarse') {

    fetch('api/register', {
      method: 'POST',
      headers: {
        "Content-Type" : "application/json"
      },
      body: JSON.stringify({ name, lastname, birthdate, email, password }),
      credentials: 'include' // para enviar las cookies al backend

    }).then (res => res.json())
    .then( data =>  {
      console.log(data)

      if(data.error) {
        setResponseText([data.error, 'error']);
        return;
      }

      if(data.status === 401) {
        setSubmitAction('login');
        setResponseText(["Usuario registrado correctamente, ahora inicia sesión", 'correcto']);
        
        setTimeout(()=> {
          setEmail('');
          setPassword(''); 
        },1000);
        return;
      }

      setResponseText([data.message, 'correcto']);
      
      setTimeout(()=> {
              setEmail('');
              setPassword(''); 
              navigate('/')
      },1000);


    })
    .catch(error => {
      setResponseText(["Error al registrar el usuario", 'error']);
    });
    
  }


}

  return (
    <>
      <div className="container-login">
      <div className="card">
        <div className="card-header">
          <div className="icon-circle">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M144 128a80 80 0 1 1 160 0 80 80 0 1 1 -160 0zm208 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0zM48 480c0-70.7 57.3-128 128-128l96 0c70.7 0 128 57.3 128 128l0 8c0 13.3 10.7 24 24 24s24-10.7 24-24l0-8c0-97.2-78.8-176-176-176l-96 0C78.8 304 0 382.8 0 480l0 8c0 13.3 10.7 24 24 24s24-10.7 24-24l0-8z"/></svg>
          </div>
          <div className="card-title">Iniciar Sessión</div>
          {/* <div className="card-description">
            Para obtener los datos meteorológicos, necesitas una API key gratuita de OpenWeatherMap
          </div> */}
        </div>

        <form onSubmit={handelSubmit}>
           {submitAction == 'registrarse' && ( 
            <> 
              <input type="text" placeholder="Ingrese su nombre" id="name" value={name} onChange={(e)=> setName(e.target.value)} required />
              <input type="text" placeholder="Ingrese su apellido" id="lastname" value={lastname} onChange={(e)=> setLastname(e.target.value)} required />
              <input type="date"   id="birthDate" value={birthdate} onChange={(e)=> setBirthdate(e.target.value)} required/>
            </>
          )}

          <input type="email" placeholder="Ingrese su correo electronico" id="email" value={email} onChange={(e)=> setEmail(e.target.value)} required/> 
          <input type="password" minLength='6' placeholder="Ingrese su contraseña" id="password" value={password} onChange={(e)=> setPassword(e.target.value)}  required/>
         
          <button type="submit" id="submitBtn">
            {submitAction == 'login' ? "Iniciar Sessión" : "Registrarse"}
          </button>
        </form>
        <p className='registrarText'>{submitAction == 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'} <button onClick={()=>submitAction == 'login' ? setSubmitAction("registrarse") : setSubmitAction("login")} id='registrarseBtn'>{submitAction == 'login' ? 'Registrate' : 'Inicia Sessión'} </button></p>
        <p className={`response ${responseText[1]} `}>{responseText[0]}</p>
      </div>
    </div>
</>
  )
}

export default Login
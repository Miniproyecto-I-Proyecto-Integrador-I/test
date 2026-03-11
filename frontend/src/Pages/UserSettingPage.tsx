import { Info, Lock } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import "../Feature/ManageUserPage/Styles/Usersettingstyle.css";

interface UserSetting {
    username: string;
    email: string;
    dailyLimit: number;
}



const UserSettingPage: React.FC = () => {
    const { user , updateDailyLimit } = useAuth();
    const [userSetting, setUserSetting] = useState<UserSetting>({
        username: user?.username || '',
        email: user?.email || '',
        dailyLimit: user?.daily_hours|| 0,
    });

    const handleClickPlus = () => {
        if(userSetting.dailyLimit < 24){
            setUserSetting({...userSetting, dailyLimit: userSetting.dailyLimit + 1});
        }
    };

    const handleClickMinus = () => {
        if(userSetting.dailyLimit > 1){
            setUserSetting({...userSetting, dailyLimit: userSetting.dailyLimit - 1});
        }
    };

  return (
    <div className='user-setting-container'>
        <h1 className='user-setting-title'>Configuración de Perfil</h1>
        <p className='user-setting-description'>Administra la información de tu cuenta y preferencias.</p>

        <div className='user-setting-card'>
            <div className='user-setting-section'>
                <h2 className='user-setting-section-title'>Nombre de usuario</h2>
                <div className='user-setting-section-content'>
                    <div className='input-container'>
                        <Lock size={16} className='input-icon' />
                        <input type="text" disabled value={userSetting.username}/>
                    </div>
                    <span className='read-only-badge'>Solo lectura</span>
                </div>
                <p className='info-text'><Info size={15}/> El nombre de usuario no se puede cambiar.</p>
            </div>

            <hr className='user-setting-divider' />

            <div className='user-setting-section'>
                <h2 className='user-setting-section-title'>Correo electrónico</h2>
                <div className='user-setting-section-content'>
                    <div className='input-container'>
                        <Lock size={16} className='input-icon' />
                        <input type="email" disabled value={userSetting.email}/>
                    </div>
                    <span className='read-only-badge'>Solo lectura</span>
                </div>
                <p className='info-text'><Info size={15}/> Contacta a soporte para actualizar tu correo.</p>
            </div>

            <hr className='user-setting-divider' />

            <div className='user-setting-section'>
                <h2 className='user-setting-section-title'>Límite diario de horas</h2>
                <div className='user-setting-section-content'>
                    <button className='hour-button' onClick={handleClickMinus}>-</button>
                    <input className='hour-input' type="number" value={userSetting.dailyLimit} max={24} onChange={(e) => setUserSetting({...userSetting, dailyLimit: Number(e.target.value)})}/>
                    <button className='hour-button' onClick={handleClickPlus}>+</button>
                    <p className='user-setting-section-content-text'>horas por día</p>
                </div>
            </div>
            
            <hr className='user-setting-divider' />

            <div className='user-setting-footer'>
                <button className='save-button' onClick={() => updateDailyLimit(userSetting.dailyLimit)}>Guardar Cambios</button>
            </div>
        </div>
    </div>
  )
}

export default UserSettingPage
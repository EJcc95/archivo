import { useState, useEffect } from 'react';
import { 
  IconUser, 
  IconLock, 
  IconDeviceFloppy, 
  IconMail, 
  IconId, 
  IconShieldLock,
  IconKey
} from '@tabler/icons-react';
import { profileService, type ProfileData, type PasswordChangeData } from '@/services/profileService';
import PageContainer from '@/components/ui/PageContainer';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import type { Usuario } from '@/types';

const ProfilePage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');
  const [user, setUser] = useState<Usuario | null>(null);

  // Form states
  const [profileData, setProfileData] = useState<ProfileData>({
    nombres: '',
    apellidos: '',
    email: '',
    nombre_usuario: ''
  });

  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setUser(data);
      setProfileData({
        nombres: data.nombres,
        apellidos: data.apellidos,
        email: data.email,
        nombre_usuario: data.nombre_usuario
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await profileService.updateProfile(profileData);
      toast.success('Perfil actualizado correctamente');
      loadProfile(); // Reload to ensure sync
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await profileService.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Contraseña actualizada correctamente');
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Error al cambiar la contraseña');
    }
  };

  const getInitials = (name: string, lastname: string) => {
    return `${name.charAt(0)}${lastname.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032DFF]"></div>
          <p className="text-gray-500 text-sm">Cargando perfil...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Mi Perfil"
        description="Gestiona tu información personal y seguridad"
        icon={<IconUser size={24} className="text-white" />}
      />

      <div className="flex flex-col lg:flex-row gap-8 p-6 lg:p-8">
        {/* Sidebar / User Card */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="relative h-32 bg-gradient-to-br from-[#032DFF] to-[#001b9e]">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2LTIuNjkgNi02cy0yLjY5LTYtNi02LTYgMi42OS02IDYgMi42OSA2IDYgNnptMCAyNGMzLjMxIDAgNi0yLjY5IDYtNnMtMi42OS02LTYtNi02IDIuNjktNiA2IDIuNjkgNiA2IDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
            </div>
            
            <div className="px-6 pb-6 text-center relative">
              <div className="relative -mt-12 mb-4 inline-block">
                <div className="w-24 h-24 rounded-full bg-white p-1 shadow-xl">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-[#032DFF] text-2xl font-bold border border-blue-100">
                    {user && getInitials(user.nombres, user.apellidos || '')}
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {user?.nombres} {user?.apellidos}
              </h3>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-[#032DFF] text-xs font-medium border border-blue-100">
                {user?.Rol?.nombre_rol}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    activeTab === 'info'
                      ? 'bg-white text-[#032DFF] shadow-sm ring-1 ring-gray-200'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                  }`}
                >
                  <IconUser size={18} strokeWidth={2} />
                  Información Personal
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    activeTab === 'security'
                      ? 'bg-white text-[#032DFF] shadow-sm ring-1 ring-gray-200'
                      : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                  }`}
                >
                  <IconShieldLock size={18} strokeWidth={2} />
                  Seguridad y Contraseña
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {activeTab === 'info' ? (
              <form onSubmit={handleProfileSubmit} className="p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                  <div className="p-2 bg-blue-50 rounded-lg text-[#032DFF]">
                    <IconId size={24} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Información Personal</h3>
                    <p className="text-sm text-gray-500">Actualiza tus datos de identificación y contacto</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nombres</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <IconUser size={18} />
                      </div>
                      <input
                        type="text"
                        value={profileData.nombres}
                        onChange={(e) => setProfileData({ ...profileData, nombres: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#032DFF]/20 focus:border-[#032DFF] transition-all text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Apellidos</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <IconUser size={18} />
                      </div>
                      <input
                        type="text"
                        value={profileData.apellidos}
                        onChange={(e) => setProfileData({ ...profileData, apellidos: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#032DFF]/20 focus:border-[#032DFF] transition-all text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nombre de Usuario</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <IconId size={18} />
                      </div>
                      <input
                        type="text"
                        value={profileData.nombre_usuario}
                        onChange={(e) => setProfileData({ ...profileData, nombre_usuario: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#032DFF]/20 focus:border-[#032DFF] transition-all text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Correo Electrónico</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <IconMail size={18} />
                      </div>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#032DFF]/20 focus:border-[#032DFF] transition-all text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-100">
                  <Button 
                    type="submit" 
                    startIcon={<IconDeviceFloppy size={20} />}
                    className="bg-[#032DFF] hover:bg-[#022FCC] text-white px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/20"
                  >
                    Guardar Cambios
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                  <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                    <IconLock size={24} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Cambiar Contraseña</h3>
                    <p className="text-sm text-gray-500">Asegura tu cuenta con una contraseña fuerte</p>
                  </div>
                </div>

                <div className="max-w-xl space-y-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Contraseña Actual</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <IconKey size={18} />
                      </div>
                      <input
                        type="password"
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#032DFF]/20 focus:border-[#032DFF] transition-all text-sm"
                        required
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Nueva Contraseña</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <IconLock size={18} />
                        </div>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#032DFF]/20 focus:border-[#032DFF] transition-all text-sm"
                          required
                          minLength={6}
                          placeholder="Mínimo 6 caracteres"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <IconLock size={18} />
                        </div>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#032DFF]/20 focus:border-[#032DFF] transition-all text-sm"
                          required
                          minLength={6}
                          placeholder="Repite la contraseña"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-100">
                  <Button 
                    type="submit" 
                    startIcon={<IconDeviceFloppy size={20} />}
                    className="bg-[#032DFF] hover:bg-[#022FCC] text-white px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/20"
                  >
                    Actualizar Contraseña
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default ProfilePage;

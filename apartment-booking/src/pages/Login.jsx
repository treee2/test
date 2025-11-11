import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building2, Lock, User, Mail, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Состояния для формы входа
  const [loginData, setLoginData] = useState({
    login: "",
    password: ""
  });
  
  // Состояния для формы регистрации
  const [registerData, setRegisterData] = useState({
    email: "",
    full_name: "",
    password: "",
    confirmPassword: ""
  });
  
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);

  // Обработчик отправки формы входа
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const user = await base44.auth.login(loginData.login, loginData.password);
      login(localStorage.getItem('authToken'));
      navigate(createPageUrl("Apartments"));
    } catch (err) {
      setError(err.message || "Ошибка при входе в систему");
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик отправки формы регистрации
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Валидация
    if (registerData.password !== registerData.confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (registerData.password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов");
      return;
    }

    // Проверка email формата
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      setError("Введите корректный email адрес");
      return;
    }

    setIsLoading(true);

    try {
      const user = await base44.auth.register(
        registerData.email,
        registerData.password,
        registerData.full_name
      );
      
      // Автоматический вход после регистрации
      login(localStorage.getItem('authToken'));
      navigate(createPageUrl("Apartments"));
    } catch (err) {
      setError(err.message || "Ошибка при регистрации");
    } finally {
      setIsLoading(false);
    }
  };

  // Проверка доступности email с debounce
  const checkEmailAvailability = async (email) => {
    if (!email || email.length < 5) {
      setEmailAvailable(null);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailAvailable(null);
      return;
    }

    setEmailChecking(true);
    
    try {
      const result = await base44.auth.checkEmail(email);
      setEmailAvailable(result.available);
    } catch (err) {
      setEmailAvailable(null);
    } finally {
      setEmailChecking(false);
    }
  };

  // Debounced email check
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "register") {
        checkEmailAvailability(registerData.email);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [registerData.email, activeTab]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="w-full max-w-md">
        {/* Логотип и название приложения */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl shadow-lg shadow-indigo-500/30 mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">LuxStay</h1>
          <p className="text-slate-600">Премиум квартиры для вашего отдыха</p>
        </div>

        {/* Карточка с формами */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center">
              {activeTab === "login" ? "Вход в систему" : "Регистрация"}
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === "login" 
                ? "Введите свои учетные данные" 
                : "Создайте новый аккаунт"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="register">Регистрация</TabsTrigger>
              </TabsList>

              {/* Форма входа */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login" className="font-semibold">
                      Логин или Email
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="login"
                        type="text"
                        value={loginData.login}
                        onChange={(e) => setLoginData({ ...loginData, login: e.target.value })}
                        placeholder="Введите логин или email"
                        className="pl-10 h-12"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="font-semibold">
                      Пароль
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="login-password"
                        type="password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        placeholder="Введите пароль"
                        className="pl-10 h-12"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert className="bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800 text-sm">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold h-12 text-base shadow-lg shadow-indigo-500/30"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Вход...
                      </>
                    ) : (
                      "Войти"
                    )}
                  </Button>
                </form>

                {/* Подсказка с тестовыми аккаунтами */}
                <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm font-semibold text-slate-700 mb-2">
                    Тестовые аккаунты:
                  </p>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div>
                      <span className="font-medium">Администратор:</span> admin / password123
                    </div>
                    <div>
                      <span className="font-medium">Пользователь 1:</span> ivan.petrov / password123
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Форма регистрации */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-semibold">
                      Email *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ 
                          ...registerData, 
                          email: e.target.value 
                        })}
                        placeholder="example@email.com"
                        className="pl-10 h-12"
                        required
                        disabled={isLoading}
                      />
                      {emailChecking && (
                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 animate-spin" />
                      )}
                      {!emailChecking && emailAvailable !== null && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {emailAvailable ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                      )}
                    </div>
                    {!emailChecking && emailAvailable === false && (
                      <p className="text-xs text-red-600">
                        Этот email уже используется
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="font-semibold">
                      Полное имя *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="full_name"
                        type="text"
                        value={registerData.full_name}
                        onChange={(e) => setRegisterData({ 
                          ...registerData, 
                          full_name: e.target.value 
                        })}
                        placeholder="Иван Иванов"
                        className="pl-10 h-12"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="font-semibold">
                      Пароль *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="register-password"
                        type="password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ 
                          ...registerData, 
                          password: e.target.value 
                        })}
                        placeholder="Минимум 6 символов"
                        className="pl-10 h-12"
                        required
                        minLength={6}
                        disabled={isLoading}
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Пароль должен содержать минимум 6 символов
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="font-semibold">
                      Подтверждение пароля *
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="confirm-password"
                        type="password"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ 
                          ...registerData, 
                          confirmPassword: e.target.value 
                        })}
                        placeholder="Повторите пароль"
                        className="pl-10 h-12"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    {registerData.confirmPassword && 
                     registerData.password !== registerData.confirmPassword && (
                      <p className="text-xs text-red-600">
                        Пароли не совпадают
                      </p>
                    )}
                  </div>

                  {error && (
                    <Alert className="bg-red-50 border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800 text-sm">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold h-12 text-base shadow-lg shadow-indigo-500/30"
                    disabled={isLoading || emailAvailable === false}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Регистрация...
                      </>
                    ) : (
                      "Зарегистрироваться"
                    )}
                  </Button>

                  <p className="text-xs text-center text-slate-600 mt-4">
                    Регистрируясь, вы соглашаетесь с условиями использования сервиса
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
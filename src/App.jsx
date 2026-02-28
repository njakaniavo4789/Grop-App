import React, { useState } from 'react';
import { Send, Home, MessageSquare, Settings, User, TrendingUp, Sprout, Leaf, CloudRain } from 'lucide-react';
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./composant/login";
import Register from "./composant/register";
import cartographie from "./composant/cartographie";

// Main layout with navbar + chat/dashboard
function MainLayout() {
  const [currentPage, setCurrentPage] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setMessages([...messages, { text: inputValue, sender: 'user' }]);
      setInputValue('');

      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: "Merci pour votre message! Comment puis-je vous aider avec vos activités agricoles aujourd'hui?",
          sender: 'ai'
        }]);
      }, 1000);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50">
      {/* Navbar */}
      <nav className="w-64 bg-white/80 backdrop-blur-sm shadow-lg flex flex-col">
        <div className="p-6">
          <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl flex items-center justify-center mb-6">
            <div className="text-white text-xl font-bold">🌾</div>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">Grok App</h1>
          <p className="text-sm text-gray-500 mt-1">Agriculture Madagascar</p>
        </div>

        <div className="flex-1 px-4">
          <div className="space-y-2">
            <NavItem
              icon={<Home size={20} />}
              label="Dashboard"
              active={currentPage === 'dashboard'}
              onClick={() => setCurrentPage('dashboard')}
            />
            <NavItem
              icon={<MessageSquare size={20} />}
              label="Chat"
              active={currentPage === 'chat'}
              onClick={() => setCurrentPage('chat')}
            />
            <NavItem
              icon={<Settings size={20} />}
              label="Paramètres"
              active={false}
              onClick={() => {}}
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Agriculteur</p>
              <p className="text-xs text-gray-500">Plan Premium</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {currentPage === 'chat'
          ? <ChatPage messages={messages} inputValue={inputValue} setInputValue={setInputValue} handleSendMessage={handleSendMessage} />
          : <DashboardPage />
        }
      </main>
    </div>
  );
}

// Root App: BrowserRouter wraps everything at the top level
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cartographie" element={<cartographie />} />
        <Route path="/" element={<MainLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active
          ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-white shadow-lg'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function ChatPage({ messages, inputValue, setInputValue, handleSendMessage }) {
  const suggestedPrompts = [
    { icon: "🌱", title: "Meilleures cultures pour Madagascar", subtitle: "Conseils de plantation" },
    { icon: "☁️", title: "Prévisions météo agricoles", subtitle: "Climat & Saisons" },
    { icon: "🌾", title: "Techniques de culture durable", subtitle: "Agriculture bio" }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Chat Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm px-8 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800">Assistant Agricole IA</h2>
        <p className="text-sm text-gray-500 mt-1">Votre guide pour l'agriculture à Madagascar</p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {messages.length === 0 ? (
          <div className="max-w-3xl mx-auto text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-2xl">🌾</span>
            </div>
            <h1 className="text-3xl font-semibold text-gray-700 mb-3">Bonjour, Agriculteur</h1>
            <h2 className="text-2xl text-gray-600 mb-2">Comment puis-je vous aider?</h2>
            <p className="text-gray-500 mb-12">
              Prêt à vous assister dans vos activités agricoles, de la plantation<br />
              à la récolte. Commençons ensemble!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(prompt.title)}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-left hover:shadow-xl hover:scale-105 transition-all border border-gray-200"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-xl">{prompt.icon}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{prompt.title}</h3>
                  <p className="text-sm text-gray-500">{prompt.subtitle}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-lg px-6 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                      : 'bg-white/70 backdrop-blur-sm text-gray-800 border border-gray-200'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 px-8 py-6">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
            <span className="text-white text-xl">📎</span>
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Posez votre question agricole..."
            className="flex-1 px-6 py-3 bg-white/70 backdrop-blur-sm rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-400"
          />
          <button
            onClick={handleSendMessage}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 font-medium"
          >
            Envoyer
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const mapRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);

  React.useEffect(() => {
    const loadLeaflet = async () => {
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        document.head.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      if (mapRef.current && !mapInstanceRef.current && window.L) {
        initializeMap();
      }
    };

    const initializeMap = () => {
      try {
        const map = window.L.map(mapRef.current, {
          zoomControl: true,
          scrollWheelZoom: true
        }).setView([-18.8792, 47.5079], 6);

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
          maxZoom: 19
        }).addTo(map);

        const regions = [
          {
            name: 'Diana',
            coordinates: [[[-11.95, 49.28], [-12.15, 50.48], [-13.41, 50.48], [-13.88, 49.77], [-13.50, 49.05], [-12.50, 48.85], [-11.95, 49.28]]],
            color: '#059669',
            data: { production: 88, crop: 'Cacao, Vanille', farmers: '45,230', area: '19,266 km²' }
          },
          {
            name: 'SAVA',
            coordinates: [[[-13.88, 49.77], [-14.00, 50.48], [-15.32, 50.48], [-15.72, 50.00], [-15.50, 49.50], [-14.50, 49.20], [-13.88, 49.77]]],
            color: '#047857',
            data: { production: 96, crop: 'Vanille, Girofle', farmers: '67,890', area: '25,518 km²' }
          },
          {
            name: 'Analamanga',
            coordinates: [[[-18.50, 46.80], [-18.60, 47.90], [-19.20, 47.90], [-19.30, 47.20], [-19.00, 46.70], [-18.50, 46.80]]],
            color: '#10b981',
            data: { production: 91, crop: 'Riz, Légumes', farmers: '123,450', area: '16,911 km²' }
          },
          {
            name: 'Vakinankaratra',
            coordinates: [[[-19.20, 46.50], [-19.30, 47.50], [-20.20, 47.30], [-20.30, 46.70], [-19.70, 46.30], [-19.20, 46.50]]],
            color: '#14b8a6',
            data: { production: 89, crop: 'Riz, Pomme de terre', farmers: '98,760', area: '16,599 km²' }
          },
          {
            name: 'Haute Matsiatra',
            coordinates: [[[-20.30, 46.50], [-20.50, 47.50], [-21.80, 47.30], [-22.00, 46.50], [-21.30, 46.20], [-20.30, 46.50]]],
            color: '#22c55e',
            data: { production: 85, crop: 'Riz, Maïs, Manioc', farmers: '87,650', area: '21,080 km²' }
          },
          {
            name: 'Atsimo-Andrefana',
            coordinates: [[[-22.00, 43.50], [-22.50, 45.50], [-25.00, 45.50], [-25.60, 44.00], [-24.50, 43.20], [-22.00, 43.50]]],
            color: '#84cc16',
            data: { production: 72, crop: 'Maïs, Haricot', farmers: '54,320', area: '66,236 km²' }
          }
        ];

        regions.forEach((region) => {
          const polygon = window.L.polygon(region.coordinates, {
            color: region.color,
            fillColor: region.color,
            fillOpacity: 0.5,
            weight: 2
          }).addTo(map);

          polygon.bindPopup(`
            <div style="font-family: system-ui; padding: 8px; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #1f2937;">${region.name}</h3>
              <p style="margin: 4px 0; font-size: 13px;"><strong>🌾 Cultures:</strong> ${region.data.crop}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>📍 Superficie:</strong> ${region.data.area}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>👨‍🌾 Agriculteurs:</strong> ${region.data.farmers}</p>
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span style="font-size: 12px; color: #6b7280;">Production:</span>
                  <span style="font-size: 14px; font-weight: bold; color: #059669;">${region.data.production}%</span>
                </div>
                <div style="background: #e5e7eb; border-radius: 9999px; height: 8px; overflow: hidden;">
                  <div style="background: linear-gradient(to right, #10b981, #059669); height: 100%; width: ${region.data.production}%; border-radius: 9999px;"></div>
                </div>
              </div>
            </div>
          `);

          polygon.on('mouseover', function () { this.setStyle({ fillOpacity: 0.7, weight: 3 }); });
          polygon.on('mouseout', function () { this.setStyle({ fillOpacity: 0.5, weight: 2 }); });
        });

        const cities = [
          { name: 'Antananarivo', coords: [-18.8792, 47.5079], capital: true },
          { name: 'Toamasina', coords: [-18.1443, 49.4122] },
          { name: 'Antsirabe', coords: [-19.8667, 47.0333] },
          { name: 'Fianarantsoa', coords: [-21.4533, 47.0858] },
          { name: 'Toliara', coords: [-23.3500, 43.6667] },
          { name: 'Antsiranana', coords: [-12.2787, 49.2917] }
        ];

        cities.forEach(city => {
          const marker = window.L.circleMarker(city.coords, {
            radius: city.capital ? 8 : 5,
            fillColor: '#ef4444',
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
          }).addTo(map);
          marker.bindPopup(`<strong>${city.name}</strong>${city.capital ? '<br/>(Capitale)' : ''}`);
        });

        mapInstanceRef.current = map;
        setTimeout(() => { map.invalidateSize(); }, 100);
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const stats = [
    { icon: <Sprout className="text-green-600" />, label: "Parcelles Actives", value: "2,847", change: "+18.5%", color: "from-green-400 to-emerald-500", subtext: "hectares" },
    { icon: <Leaf className="text-emerald-600" />, label: "Production Totale", value: "12.5T", change: "+12.8%", color: "from-emerald-400 to-lime-500", subtext: "cette saison" },
    { icon: <CloudRain className="text-blue-600" />, label: "Pluviométrie", value: "1,234mm", change: "+8.2%", color: "from-blue-400 to-cyan-500", subtext: "cette année" },
    { icon: <TrendingUp className="text-lime-600" />, label: "Taux de Réussite", value: "94.7%", change: "+6.3%", color: "from-lime-400 to-green-500", subtext: "des cultures" }
  ];

  const regions = [
    { id: 1, name: "Diana", production: 88, crop: "Cacao, Vanille", color: "#059669", area: "19,266 km²", farmers: "45,230" },
    { id: 2, name: "SAVA", production: 96, crop: "Vanille, Girofle", color: "#047857", area: "25,518 km²", farmers: "67,890" },
    { id: 3, name: "Analamanga", production: 91, crop: "Riz, Légumes", color: "#10b981", area: "16,911 km²", farmers: "123,450" },
    { id: 4, name: "Vakinankaratra", production: 89, crop: "Riz, Pomme de terre", color: "#14b8a6", area: "16,599 km²", farmers: "98,760" },
    { id: 5, name: "Haute Matsiatra", production: 85, crop: "Riz, Maïs, Manioc", color: "#22c55e", area: "21,080 km²", farmers: "87,650" },
    { id: 6, name: "Atsimo-Andrefana", production: 72, crop: "Maïs, Haricot", color: "#84cc16", area: "66,236 km²", farmers: "54,320" }
  ];

  const weatherData = [
    { day: "Lun", temp: 24, rain: 20 },
    { day: "Mar", temp: 26, rain: 40 },
    { day: "Mer", temp: 23, rain: 80 },
    { day: "Jeu", temp: 25, rain: 60 },
    { day: "Ven", temp: 27, rain: 30 },
    { day: "Sam", temp: 28, rain: 10 },
    { day: "Dim", temp: 26, rain: 50 }
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="bg-white/80 backdrop-blur-sm shadow-sm px-8 py-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-gray-800">Tableau de Bord Agricole</h2>
            <p className="text-gray-500 mt-1">Vue d'ensemble de l'agriculture à Madagascar - Mise à jour en temps réel</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl">
            <div className="text-xs opacity-90">Saison Actuelle</div>
            <div className="text-lg font-bold">Été Austral 2026</div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  {stat.icon}
                </div>
                <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">{stat.change}</span>
              </div>
              <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.subtext}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          <div className="lg:col-span-3 bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Carte Réelle de Madagascar</h3>
              <div className="text-xs text-gray-500">Cliquez sur une région pour plus d'infos</div>
            </div>
            <div
              ref={mapRef}
              className="w-full h-[600px] rounded-xl overflow-hidden shadow-lg border-2 border-gray-300"
              style={{ zIndex: 1 }}
            ></div>
            <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-3 text-sm">Légende</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-sm"></div>
                  <span className="text-xs text-gray-600">Villes principales</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-emerald-600 shadow-sm opacity-50"></div>
                  <span className="text-xs text-gray-600">Régions agricoles</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Météo Agricole - 7 Jours</h3>
            <div className="space-y-3">
              {weatherData.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                      <CloudRain size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{day.day}</p>
                      <p className="text-xs text-gray-500">{day.temp}°C</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-500" style={{ width: `${day.rain}%` }}></div>
                    </div>
                    <span className="text-xs font-medium text-gray-600 w-8">{day.rain}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white">⚠️</span>
                </div>
                <div>
                  <p className="font-semibold text-amber-800 text-sm">Alerte Météo</p>
                  <p className="text-xs text-amber-700 mt-1">Fortes pluies prévues mercredi. Protégez vos cultures sensibles.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Production par Région</h3>
            <div className="space-y-3">
              {regions.map((region, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-md transition-all cursor-pointer border border-green-100"
                  onMouseEnter={() => setSelectedRegion(region.id)}
                  onMouseLeave={() => setSelectedRegion(null)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full shadow-md" style={{ backgroundColor: region.color }}></div>
                    <div>
                      <span className="font-semibold text-gray-800">{region.name}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{region.crop}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{region.farmers} agriculteurs</p>
                      <p className="text-xs text-gray-400">{region.area}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-28 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${region.production}%`, backgroundColor: region.color }}></div>
                      </div>
                      <span className="text-sm font-bold text-gray-700 w-10">{region.production}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Performance des Cultures</h3>
            <div className="space-y-4">
              {[
                { name: "Riz Paddy", yield: "4.2T/ha", status: "Excellent", trend: "+12%", icon: "🌾", color: "from-green-400 to-emerald-500" },
                { name: "Vanille", yield: "2.8kg/ha", status: "Très Bon", trend: "+18%", icon: "🌿", color: "from-emerald-400 to-lime-500" },
                { name: "Café Arabica", yield: "1.5T/ha", status: "Bon", trend: "+8%", icon: "☕", color: "from-lime-400 to-green-500" },
                { name: "Girofle", yield: "850kg/ha", status: "Excellent", trend: "+15%", icon: "🌸", color: "from-green-500 to-emerald-600" },
                { name: "Cacao", yield: "1.2T/ha", status: "Bon", trend: "+10%", icon: "🍫", color: "from-emerald-500 to-lime-600" }
              ].map((crop, index) => (
                <div key={index} className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 bg-gradient-to-br ${crop.color} rounded-xl flex items-center justify-center text-2xl shadow-md`}>
                        {crop.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{crop.name}</h4>
                        <p className="text-xs text-gray-500">Rendement: {crop.yield}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{crop.trend}</span>
                      <p className="text-xs text-gray-500 mt-1">{crop.status}</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`bg-gradient-to-r ${crop.color} h-2 rounded-full`} style={{ width: `${70 + index * 5}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
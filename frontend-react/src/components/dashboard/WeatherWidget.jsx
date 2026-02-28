import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaCloudSun, FaTemperatureHigh, FaTint, FaWind } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';

/**
 * Weather Widget Component
 * Displays current weather for user location
 * Requirement 20.2: Show weather for user's saved location
 */
export default function WeatherWidget({ data, loading, error, location }) {
    const { t } = useTranslation();

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('dashboard.weatherWidget')}</h2>
                <div className="flex items-center justify-center h-40">
                    <ClipLoader color="#3B82F6" size={40} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('dashboard.weatherWidget')}</h2>
                <div className="text-center text-red-500 py-8">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('dashboard.weatherWidget')}</h2>
                <div className="text-center text-gray-500 py-8">
                    <p>{t('dashboard.noWeatherData')}</p>
                </div>
            </div>
        );
    }

    const current = data.current || data;

    // Extract weather values, handling various API response shapes
    // OpenWeatherMap returns: { main: { temp, feels_like, humidity }, wind: { speed }, weather: [{ description }] }
    // Our backend may return: { temperature, condition, humidity, wind_speed, feels_like }
    const temp = current.temperature ?? current.temp ?? current.main?.temp ?? null;
    const feelsLike = current.feels_like ?? current.main?.feels_like ?? null;
    const humidity = current.humidity ?? current.main?.humidity ?? null;
    const windSpeed = current.wind_speed ?? current.wind ?? current.wind?.speed ?? null;
    const condition = current.condition ?? current.description ?? current.weather?.[0]?.description ?? null;

    const noData = t('dashboard.noData');

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">{t('dashboard.weatherWidget')}</h2>
                <Link to="/weather" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    {t('dashboard.viewDetails')} →
                </Link>
            </div>

            <div className="space-y-4">
                {/* Location */}
                <div className="text-gray-600 text-sm">
                    {location ? t('dashboard.forLocation', { location }) : t('profile.location')}
                </div>

                {/* Main Weather Info */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <FaCloudSun size={48} className="text-yellow-500" />
                        <div>
                            <p className="text-4xl font-bold text-gray-800">
                                {temp !== null ? `${Math.round(temp)}°C` : noData}
                            </p>
                            <p className="text-gray-600 capitalize">
                                {condition || noData}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Additional Weather Details */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                        <FaTint className="text-blue-500 mx-auto mb-1" size={20} />
                        <p className="text-xs text-gray-500">{t('weather.humidity')}</p>
                        <p className="text-sm font-semibold text-gray-800">
                            {humidity !== null ? `${humidity}%` : noData}
                        </p>
                    </div>
                    <div className="text-center">
                        <FaWind className="text-gray-500 mx-auto mb-1" size={20} />
                        <p className="text-xs text-gray-500">{t('weather.wind')}</p>
                        <p className="text-sm font-semibold text-gray-800">
                            {windSpeed !== null ? `${windSpeed} km/h` : noData}
                        </p>
                    </div>
                    <div className="text-center">
                        <FaTemperatureHigh className="text-red-500 mx-auto mb-1" size={20} />
                        <p className="text-xs text-gray-500">{t('dashboard.feelsLike')}</p>
                        <p className="text-sm font-semibold text-gray-800">
                            {feelsLike !== null ? `${Math.round(feelsLike)}°C` : noData}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaFileAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';

/**
 * Scheme Widget Component
 * Displays scheme recommendations as a horizontal slider
 * Requirement 20.4: Show relevant scheme recommendations based on user profile
 */
export default function SchemeWidget({ schemes, loading, error }) {
    const { t } = useTranslation();
    const sliderRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    // Ensure schemes is always an array
    const schemesArray = Array.isArray(schemes) ? schemes : [];

    const updateScrollButtons = () => {
        if (sliderRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
        }
    };

    const scroll = (direction) => {
        if (sliderRef.current) {
            const cardWidth = 270;
            sliderRef.current.scrollBy({
                left: direction === 'left' ? -cardWidth : cardWidth,
                behavior: 'smooth',
            });
            setTimeout(updateScrollButtons, 350);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('dashboard.schemeRecommendations')}</h2>
                <div className="flex items-center justify-center h-40">
                    <ClipLoader color="#3B82F6" size={40} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('dashboard.schemeRecommendations')}</h2>
                <div className="text-center text-red-500 py-8">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!schemesArray || schemesArray.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{t('dashboard.schemeRecommendations')}</h2>
                <div className="text-center text-gray-500 py-8">
                    <p>{t('dashboard.noSchemeRecommendations')}</p>
                </div>
            </div>
        );
    }

    // Category tag colors
    const tagColors = {
        financial_assistance: 'bg-blue-100 text-blue-700',
        loan: 'bg-green-100 text-green-700',
        insurance: 'bg-purple-100 text-purple-700',
        income_support: 'bg-orange-100 text-orange-700',
        marketing: 'bg-teal-100 text-teal-700',
        crop_insurance: 'bg-indigo-100 text-indigo-700',
        subsidy: 'bg-yellow-100 text-yellow-700',
        training: 'bg-pink-100 text-pink-700',
    };

    const getTagColor = (tag) => {
        const normalized = tag?.toLowerCase()?.replace(/\s+/g, '_');
        return tagColors[normalized] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">{t('dashboard.schemeRecommendations')}</h2>
                <Link to="/schemes" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    {t('dashboard.viewAll')} →
                </Link>
            </div>

            {/* Horizontal Slider */}
            <div className="relative">
                {/* Left Arrow */}
                {canScrollLeft && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 transition-colors border border-gray-200"
                        style={{ marginLeft: '-12px' }}
                    >
                        <FaChevronLeft className="text-gray-600" size={14} />
                    </button>
                )}

                {/* Slider Container */}
                <div
                    ref={sliderRef}
                    onScroll={updateScrollButtons}
                    className="flex gap-3 overflow-x-auto pb-2"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch',
                    }}
                >
                    <style>{`
                        .scheme-slider::-webkit-scrollbar { display: none; }
                    `}</style>
                    {schemesArray.map((scheme, index) => {
                        const name = scheme.scheme_name || scheme.name || scheme.title || 'Unnamed Scheme';
                        const description = scheme.description || scheme.summary || '';
                        const schemeCategory = scheme.category || scheme.scheme_type || '';
                        const categories = schemeCategory
                            ? (Array.isArray(schemeCategory) ? schemeCategory : [schemeCategory])
                            : (scheme.categories || scheme.tags
                                ? (Array.isArray(scheme.categories || scheme.tags)
                                    ? (scheme.categories || scheme.tags)
                                    : [scheme.categories || scheme.tags])
                                : []);
                        const schemeId = scheme.scheme_id || scheme.id || scheme.scheme_name || index;

                        return (
                            <div
                                key={schemeId}
                                className="flex-shrink-0 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow flex flex-col"
                                style={{ minWidth: '250px', maxWidth: '270px' }}
                            >
                                {/* Header with icon and name */}
                                <div className="flex items-start gap-2 mb-2">
                                    <FaFileAlt className="text-blue-500 mt-1 flex-shrink-0" size={18} />
                                    <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight" title={name}>
                                        {name}
                                    </h3>
                                </div>

                                {/* Category Tags */}
                                {categories.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {categories.slice(0, 2).map((tag, i) => (
                                            <span
                                                key={i}
                                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTagColor(tag)}`}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Description */}
                                <p className="text-xs text-gray-600 line-clamp-3 flex-1 mb-3">
                                    {description}
                                </p>

                                {/* View Details Link */}
                                <Link
                                    to={`/schemes/${schemeId}`}
                                    className="inline-block text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded transition-colors self-start"
                                >
                                    View Details
                                </Link>
                            </div>
                        );
                    })}
                </div>

                {/* Right Arrow */}
                {canScrollRight && schemesArray.length > 2 && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 transition-colors border border-gray-200"
                        style={{ marginRight: '-12px' }}
                    >
                        <FaChevronRight className="text-gray-600" size={14} />
                    </button>
                )}
            </div>

            {/* Scroll indicator dots */}
            {schemesArray.length > 2 && (
                <div className="flex justify-center gap-1 mt-3">
                    {schemesArray.map((_, index) => (
                        <div
                            key={index}
                            className="w-1.5 h-1.5 rounded-full bg-gray-300"
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

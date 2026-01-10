import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, CreditCard, Landmark, FileText, 
  CheckCircle2, Star, ShieldCheck, ArrowRight, 
  TrendingUp, Sparkles, Loader2, Info, Lock
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { getCreditProducts, getAiProductRecommendations } from '../services/marketplaceService';
import { CreditProduct, ProductType } from '../types';

const Marketplace: React.FC = () => {
  const { user } = useUser();
  const [products, setProducts] = useState<CreditProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ProductType | 'ALL'>('ALL');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  useEffect(() => {
    loadMarketplace();
  }, []);

  const loadMarketplace = async () => {
    setLoading(true);
    setAiAnalyzing(true);
    try {
      const baseProducts = await getCreditProducts();
      setProducts(baseProducts); // Show content fast
      
      // Enhance with AI in background
      const ranked = await getAiProductRecommendations(user, baseProducts);
      setProducts(ranked);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setAiAnalyzing(false);
    }
  };

  const filteredProducts = filter === 'ALL' 
    ? products 
    : products.filter(p => p.type === filter);

  const getMatchColor = (score?: number) => {
    if (!score) return 'bg-slate-100 text-slate-600';
    if (score >= 90) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    if (score >= 75) return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <ShoppingBag className="text-indigo-600 dark:text-indigo-400 w-8 h-8" />
            Credit Builder Marketplace
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Hand-picked financial products tailored to improve your specific credit profile.
          </p>
        </div>
        
        {aiAnalyzing ? (
          <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-lg">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>AI Matching...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
            <Sparkles className="w-4 h-4" />
            <span>Personalized for {user.firstName}</span>
          </div>
        )}
      </div>

      {/* AI Recommendation Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-lg font-bold mb-2 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-yellow-300" />
            Recommendation Strategy
          </h2>
          <p className="text-indigo-100 max-w-2xl text-sm leading-relaxed">
            Based on your score of <strong>{user.creditScore.experian}</strong>, your best path to 700+ is to add 
            <span className="font-bold text-white"> 1 Secured Card</span> to lower utilization and 
            <span className="font-bold text-white"> 1 Installment Loan</span> to improve credit mix.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'ALL', label: 'All Products', icon: Star },
          { id: 'SECURED_CARD', label: 'Secured Cards', icon: Lock },
          { id: 'LOAN', label: 'Credit Builder Loans', icon: Landmark },
          { id: 'RENT_REPORTING', label: 'Rent Reporting', icon: FileText },
          { id: 'UNSECURED_CARD', label: 'Unsecured Cards', icon: CreditCard },
        ].map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id as any)}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                filter === cat.id
                  ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div 
              key={product.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col hover:border-indigo-300 dark:hover:border-indigo-500 transition-all group"
            >
              {/* Product Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 relative">
                 {product.matchScore && product.matchScore > 85 && (
                   <div className="absolute top-4 right-4 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center">
                     <Sparkles className="w-3 h-3 mr-1" /> BEST MATCH
                   </div>
                 )}
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-xs font-bold text-slate-500 overflow-hidden">
                      {product.imageUrl.includes('placeholder') ? (
                         product.name.substring(0,2).toUpperCase()
                      ) : (
                         <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      )}
                   </div>
                   <div>
                     <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">
                       {product.name}
                     </h3>
                     <p className="text-xs text-slate-500 dark:text-slate-400">{product.issuer}</p>
                   </div>
                 </div>
              </div>

              {/* Match Details */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-750">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Approval Odds</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      product.approvalOdds === 'EXCELLENT' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {product.approvalOdds}
                    </span>
                 </div>
                 {product.aiReasoning && (
                   <div className="flex items-start gap-2">
                     <Info className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                     <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                       "{product.aiReasoning}"
                     </p>
                   </div>
                 )}
              </div>

              {/* Specs */}
              <div className="p-6 flex-1 space-y-4">
                 <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-2 border border-slate-100 dark:border-slate-700 rounded-lg">
                       <div className="text-xs text-slate-400 uppercase font-bold">Annual Fee</div>
                       <div className="font-bold text-slate-800 dark:text-white">${product.annualFee}</div>
                    </div>
                    {product.apr && (
                      <div className="p-2 border border-slate-100 dark:border-slate-700 rounded-lg">
                         <div className="text-xs text-slate-400 uppercase font-bold">APR</div>
                         <div className="font-bold text-slate-800 dark:text-white">{product.apr}</div>
                      </div>
                    )}
                 </div>
                 
                 <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Key Features</h4>
                    <ul className="space-y-1">
                       {product.features.map((feat, i) => (
                         <li key={i} className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                           <CheckCircle2 className="w-3 h-3 text-green-500 mr-2" />
                           {feat}
                         </li>
                       ))}
                    </ul>
                 </div>
              </div>

              {/* Action */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-700 mt-auto">
                 <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-sm transition-colors flex items-center justify-center">
                    Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-slate-400 text-center mt-12 max-w-2xl mx-auto">
        CreditFix AI may receive compensation when you click on links to products from our partners. 
        However, our AI recommendations are based solely on your credit profile needs. 
        Approval is not guaranteed.
      </p>

    </div>
  );
};

export default Marketplace;
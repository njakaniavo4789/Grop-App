import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/Accordion';
import { FluidBackground } from '@/components/ui/FluidBackground';
import { Sparkles, ChevronRight } from 'lucide-react';

// ─── Primitives ───────────────────────────────────────────────────────────────

function Checkbox({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group py-0.5" onClick={onChange}>
      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
        checked ? 'border-[var(--agri-500)]' : 'border-[var(--border-medium)] group-hover:border-[var(--agri-500)]'
      }`}
        style={{ background: checked ? 'var(--agri-500)' : 'transparent' }}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="text-sm select-none transition-colors" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 mb-4">
      <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>{title}</p>
      {children}
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const REGIONS = [
  'Analamanga','Alaotra-Mangoro','Menabe','Atsimo-Andrefana','Sava','Diana',
  'Boeny','Vakinankaratra',"Amoron'i Mania",'Haute Matsiatra','Ihorombe',
  'Atsimo-Atsinanana','Atsinanana','Analanjirofo','Sofia','Betsiboka',
  'Melaky','Vatovavy','Fitovinany','Androy',
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ForecastPage() {
  const [region, setRegion]           = useState('');
  const [altitude, setAltitude]       = useState('');
  const [soilType, setSoilType]       = useState<string[]>([]);
  const [cultureMode, setCultureMode] = useState<string[]>([]);
  const [superficie, setSuperficie]   = useState('');
  const [culture, setCulture]         = useState<string[]>([]);
  const [variete, setVariete]         = useState('');
  const [agePlants, setAgePlants]     = useState('');
  const [saison, setSaison]           = useState<string[]>([]);
  const [meteo, setMeteo]             = useState<string[]>([]);
  const [problemes, setProblemes]     = useState<string[]>([]);
  const [objectifs, setObjectifs]     = useState<string[]>([]);
  const [loading, setLoading]         = useState(false);

  const toggle = (arr: string[], val: string, set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  const handleGenerate = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false);
  };

  const inputCls = `w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition-colors`;
  const inputStyle = {
    background: 'var(--bg-glass)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)',
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      <FluidBackground />

      <div
        className="relative z-10 flex flex-col h-full overflow-y-auto"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}
      >
        {/* ── Header — same style as WelcomeScreen ── */}
        <div className="flex flex-col items-center text-center pt-14 pb-8 px-6 flex-shrink-0">
          <h1 style={{
            fontSize: 28,
            fontWeight: 600,
            fontFamily: 'var(--font-display)',
            background: 'linear-gradient(135deg, #ffffff, var(--agri-400))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 8,
          }}>
            Prévision Agricole IA
          </h1>

          <p style={{
            color: 'var(--text-muted)',
            fontSize: 14,
            lineHeight: 1.6,
            maxWidth: 400,
            marginBottom: 0,
          }}>
            Remplissez les sections et générez une prévision
          </p>
        </div>

        {/* ── Accordion form — centered ── */}
        <div className="flex flex-col items-center w-full px-6 pb-10 flex-shrink-0">
          <div className="w-full" style={{ maxWidth: 560 }}>

            <Accordion type="multiple" className="w-full mb-5">

              <AccordionItem value="parcelle" className="py-2">
                <AccordionTrigger>Ma Parcelle / Ma Zone</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-5">
                    <Section title="Région">
                      <select value={region} onChange={e => setRegion(e.target.value)}
                        className={inputCls} style={inputStyle}>
                        <option value="">Sélectionner une région…</option>
                        {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </Section>

                    <Section title="Altitude">
                      {['Basse altitude (< 400m)','Moyenne altitude (400–800m)','Haute altitude (> 800m)'].map(v => (
                        <Checkbox key={v} id={v} label={v} checked={altitude === v} onChange={() => setAltitude(altitude === v ? '' : v)} />
                      ))}
                    </Section>

                    <Section title="Type de sol">
                      {['Sol alluvial','Sol argileux','Sol rouge des hautes terres','Sol volcanique','Sol sableux','Autre'].map(v => (
                        <Checkbox key={v} id={v} label={v} checked={soilType.includes(v)} onChange={() => toggle(soilType, v, setSoilType)} />
                      ))}
                    </Section>

                    <Section title="Mode de culture">
                      {['Irrigué','Pluvial (pluie seulement)','Bas-fond'].map(v => (
                        <Checkbox key={v} id={v} label={v} checked={cultureMode.includes(v)} onChange={() => toggle(cultureMode, v, setCultureMode)} />
                      ))}
                    </Section>

                    <Section title="Superficie (ha)">
                      <input type="number" value={superficie} onChange={e => setSuperficie(e.target.value)}
                        placeholder="Ex: 2.5" className={inputCls} style={inputStyle} />
                    </Section>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="culture" className="py-2">
                <AccordionTrigger>Culture et Variété</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-5">
                    <Section title="Culture concernée">
                      {['Riz','Café (Arabica / Robusta)','Vanille','Manioc','Maïs','Girofle','Litchi'].map(v => (
                        <Checkbox key={v} id={v} label={v} checked={culture.includes(v)} onChange={() => toggle(culture, v, setCulture)} />
                      ))}
                    </Section>

                    <Section title="Variété">
                      <input type="text" value={variete} onChange={e => setVariete(e.target.value)}
                        placeholder="Ex: FOFIFA 154, Bourbon…" className={inputCls} style={inputStyle} />
                    </Section>

                    <Section title="Âge des plants (café / vanille)">
                      {['Jeunes (< 3 ans)','Adultes (3–15 ans)','Vieux (> 15 ans)'].map(v => (
                        <Checkbox key={v} id={v} label={v} checked={agePlants === v} onChange={() => setAgePlants(agePlants === v ? '' : v)} />
                      ))}
                    </Section>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="meteo" className="py-2">
                <AccordionTrigger>Conditions et Météo</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-5">
                    <Section title="Saison actuelle">
                      {['Saison des pluies','Saison sèche','Période de semis','Période de récolte'].map(v => (
                        <Checkbox key={v} id={v} label={v} checked={saison.includes(v)} onChange={() => toggle(saison, v, setSaison)} />
                      ))}
                    </Section>

                    <Section title="Prévisions météo (4–8 semaines)">
                      {['Pluie abondante attendue','Pluie normale','Pluie faible / Sécheresse','Risque de cyclone / fortes pluies'].map(v => (
                        <Checkbox key={v} id={v} label={v} checked={meteo.includes(v)} onChange={() => toggle(meteo, v, setMeteo)} />
                      ))}
                    </Section>

                    <Section title="Problèmes observés">
                      {["Attaques de maladies (pyriculariose, RYMV, rouille…)","Attaques d'insectes","Manque d'eau","Excès d'eau / inondation","Carence en nutriments"].map(v => (
                        <Checkbox key={v} id={v} label={v} checked={problemes.includes(v)} onChange={() => toggle(problemes, v, setProblemes)} />
                      ))}
                    </Section>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="objectifs" className="py-2">
                <AccordionTrigger>Objectifs (optionnel)</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1.5">
                    {["Maximiser le rendement","Réduire le risque de maladie","Adapter au changement climatique","Améliorer la qualité pour l'export","Minimiser les coûts (intrants)"].map(v => (
                      <Checkbox key={v} id={v} label={v} checked={objectifs.includes(v)} onChange={() => toggle(objectifs, v, setObjectifs)} />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

            </Accordion>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="relative w-full py-3.5 rounded-xl overflow-hidden text-sm font-semibold text-white transition-opacity duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, var(--agri-600), var(--agri-500))',
                boxShadow: '0 4px 24px rgba(16,185,129,0.2)',
              }}
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Génération en cours…
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    Générer la prévision
                    <ChevronRight size={15} />
                  </>
                )}
              </span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

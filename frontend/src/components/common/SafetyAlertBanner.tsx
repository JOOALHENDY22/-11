import React from 'react';
import { SafetyAlert } from '../../types';
import { AlertTriangle, ShieldAlert, Info, CheckCircle2 } from 'lucide-react';
import { getSeverityStyle } from '../../utils/formatters';

interface SafetyAlertBannerProps {
  alerts: SafetyAlert[];
  showNoAlertState?: boolean;
}

export const SafetyAlertBanner: React.FC<SafetyAlertBannerProps> = ({
  alerts,
  showNoAlertState = false
}) => {
  if (alerts.length === 0) {
    if (!showNoAlertState) return null;
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-mint-50/80 border border-mint-200 text-mint-800 text-sm">
        <CheckCircle2 className="w-5 h-5 text-mint-600 shrink-0" />
        <div>
          <span className="font-semibold">Clinical Decision Support: </span>
          <span>No drug-allergy or critical drug-drug conflicts detected. Safe to proceed.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const style = getSeverityStyle(alert.severity);
        const isCritical = alert.severity === 'critical';

        return (
          <div
            key={alert.id}
            className={`p-4 rounded-2xl border ${style.bg} ${style.border} ${style.text} transition-all shadow-sm`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {isCritical ? (
                  <ShieldAlert className="w-5 h-5 text-rose-600 animate-pulse" />
                ) : alert.severity === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                ) : (
                  <Info className="w-5 h-5 text-sky-600" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-bold text-sm tracking-tight flex items-center gap-2">
                    {alert.title}
                  </h4>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${style.badge}`}
                  >
                    {alert.severity}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {alert.description}
                </p>

                {alert.recommendation && (
                  <div className="mt-2 text-xs bg-white/80 p-2.5 rounded-xl border border-slate-200/70 text-slate-800 font-medium">
                    <span className="font-bold text-navy-900">CDS Recommendation: </span>
                    {alert.recommendation}
                  </div>
                )}

                {alert.involvedItems && alert.involvedItems.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] font-semibold text-slate-500">Involved:</span>
                    {alert.involvedItems.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-semibold"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

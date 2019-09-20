import React, { useState } from 'react';
import './style.scss';

export const Mappings = () => {
  const [step, setStep] = useState(1);

  return (
    <div className="settings-page">
      <div className="title">
        Koblinger
      </div>
      <div className="main wizard">
        <div className="temp-wizard">
          <div>
            {step === 1 && (
              <div className="step-container" id="step-1-container">
                Step 1
              </div>
            )}
            {step === 2 && (
              <div className="step-container" id="step-2-container">
                Step 2
              </div>
            )}
            {step === 3 && (
              <div className="step-container" id="step-3-container">
                Step 3
              </div>
            )}
          </div>
          <div className="temp-wizard-steps">
            <div className="step" id="step-1" onClick={() => setStep(1)}>1</div>
            <div className="step" id="step-2" onClick={() => setStep(2)}>2</div>
            <div className="step" id="step-3" onClick={() => setStep(3)}>3</div>
          </div>
        </div>
      </div>
    </div>
  );
};

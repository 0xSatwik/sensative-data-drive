import React from 'react';
import { checkPasswordStrength, PasswordStrength } from '../utils/crypto';
import { FiCheck, FiX } from 'react-icons/fi';

interface PasswordStrengthMeterProps {
    password: string;
    showRequirements?: boolean;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
    password,
    showRequirements = true
}) => {
    const strength: PasswordStrength = checkPasswordStrength(password);

    if (!password) {
        return null;
    }

    const getLabelText = () => {
        switch (strength.label) {
            case 'weak': return 'Weak';
            case 'fair': return 'Fair';
            case 'good': return 'Good';
            case 'strong': return 'Strong';
            default: return '';
        }
    };

    const getProgressWidth = () => {
        return `${((strength.score + 1) / 5) * 100}%`;
    };

    const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
        <div className={`flex items-center text-xs ${met ? 'text-green-600' : 'text-gray-400'}`}>
            {met ? (
                <FiCheck className="h-3 w-3 mr-1 flex-shrink-0" />
            ) : (
                <FiX className="h-3 w-3 mr-1 flex-shrink-0" />
            )}
            <span>{text}</span>
        </div>
    );

    return (
        <div className="mt-2">
            {/* Strength bar */}
            <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                        className="h-full transition-all duration-300 rounded-full"
                        style={{
                            width: getProgressWidth(),
                            backgroundColor: strength.color
                        }}
                    />
                </div>
                <span
                    className="text-xs font-medium min-w-[50px]"
                    style={{ color: strength.color }}
                >
                    {getLabelText()}
                </span>
            </div>

            {/* Requirements checklist */}
            {showRequirements && (
                <div className="mt-2 grid grid-cols-2 gap-1">
                    <RequirementItem
                        met={strength.requirements.minLength}
                        text="12+ characters"
                    />
                    <RequirementItem
                        met={strength.requirements.hasUppercase}
                        text="Uppercase letter"
                    />
                    <RequirementItem
                        met={strength.requirements.hasLowercase}
                        text="Lowercase letter"
                    />
                    <RequirementItem
                        met={strength.requirements.hasNumber}
                        text="Number"
                    />
                    <RequirementItem
                        met={strength.requirements.hasSymbol}
                        text="Symbol (!@#$...)"
                    />
                </div>
            )}

            {/* Warning for weak passwords */}
            {strength.score < 3 && password.length > 0 && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                    ⚠️ Use a stronger password to protect your crypto data
                </div>
            )}
        </div>
    );
};

export default PasswordStrengthMeter;

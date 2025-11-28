'use client';

interface SessionProgressProps {
    currentStep: number;
    totalSteps?: number;
    steps?: string[];
}

export function SessionProgress({ currentStep, totalSteps = 5, steps }: SessionProgressProps) {
    const defaultSteps = ['Setup', 'Add Items', 'Problem Framing', 'Voting', 'Prioritisation', 'Summary'];
    const stepLabels = steps || defaultSteps;

    return (
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
            <div className="max-w-5xl mx-auto">
                {/* Progress Bar */}
                <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                            Step {currentStep} of {totalSteps}
                        </span>
                        <span className="text-sm text-gray-500">
                            {stepLabels[currentStep - 1]}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Step Labels */}
                <div className="hidden sm:flex items-center justify-between">
                    {stepLabels.slice(0, totalSteps).map((step, index) => {
                        const stepNumber = index + 1;
                        const isActive = stepNumber === currentStep;
                        const isCompleted = stepNumber < currentStep;

                        return (
                            <div key={step} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${isCompleted
                                                ? 'bg-blue-600 text-white'
                                                : isActive
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-gray-500'
                                            }`}
                                    >
                                        {isCompleted ? '✓' : stepNumber}
                                    </div>
                                    <span
                                        className={`text-xs mt-1 ${isActive ? 'text-blue-600 font-medium' : 'text-gray-500'
                                            }`}
                                    >
                                        {step}
                                    </span>
                                </div>
                                {index < totalSteps - 1 && (
                                    <div className="w-12 h-0.5 bg-gray-200 mx-2" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

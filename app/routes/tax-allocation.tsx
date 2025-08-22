import { useState } from 'react';
import type { Route } from "./+types/tax-allocation";
import { Calculator, DollarSign, PieChart, Info, FileText, Users, Heart, GraduationCap, Shield, Building, Leaf, Briefcase } from 'lucide-react';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New York State Tax Allocation Tool" },
    { name: "description", content: "Discover exactly where your New York State tax dollars go." },
  ];
}

export default function TaxAllocation() {
  const [income, setIncome] = useState('');
  const [filingStatus, setFilingStatus] = useState('single');
  const [taxAmount, setTaxAmount] = useState('');
  const [taxType, setTaxType] = useState('income');
  const [activeTab, setActiveTab] = useState('calculate');
  const [showResults, setShowResults] = useState(false);
  const [allocations, setAllocations] = useState({});
  const [estimatedTax, setEstimatedTax] = useState(0);

  // Based on the FY 2026 Enacted Budget data from OpenBudget.NY.Gov
  const budgetAllocations = {
    income: {
      // State Operating Funds spending percentages with more detailed breakdowns
      'Education/School Aid': { percent: 29, description: 'K-12 public schools, special education, teacher training, school construction aid', icon: GraduationCap },
      'Health/Medicaid': { percent: 27, description: 'Medicaid for low-income families, hospitals, nursing homes, mental health clinics', icon: Heart },
      'Higher Education': { percent: 9, description: 'SUNY and CUNY colleges, community colleges, student financial aid', icon: GraduationCap },
      'Mental Hygiene': { percent: 8, description: 'Mental health treatment, substance abuse programs, developmental disabilities services', icon: Heart },
      'Social Welfare Programs': { percent: 5, description: 'SNAP food assistance, TANF cash assistance, child care subsidies, homeless services', icon: Users },
      'Transportation Infrastructure': { percent: 4, description: 'Highway maintenance, bridge repairs, MTA funding, airport improvements', icon: Building },
      'Public Safety & Justice': { percent: 4, description: 'State police, prisons, courts, district attorneys, probation services', icon: Shield },
      'Environmental Protection': { percent: 3, description: 'Parks maintenance, environmental cleanup, water quality, climate programs', icon: Leaf },
      'Economic Development': { percent: 3, description: 'Business incentives, tourism promotion, workforce development, infrastructure grants', icon: Briefcase },
      'Elected Officials & Government Operations': { percent: 3, description: 'Legislature, Governor\'s office, state agencies administration', icon: Users },
      'Emergency Services & Preparedness': { percent: 2, description: 'Emergency management, disaster response, homeland security', icon: Shield },
      'Agriculture & Rural Development': { percent: 2, description: 'Farm support programs, rural infrastructure, food safety inspection', icon: Leaf },
      'Arts & Cultural Programs': { percent: 1, description: 'Museums, libraries, arts grants, historical preservation', icon: Building }
    },
    corporate: {
      'Education/School Aid': { percent: 29, description: 'Corporate taxes contribute to K-12 education funding and higher education', icon: GraduationCap },
      'Health/Medicaid': { percent: 27, description: 'Corporate taxes help fund healthcare programs and Medicaid', icon: Heart },
      'Economic Development & Business Programs': { percent: 15, description: 'Business development programs, manufacturing support, economic incentives', icon: Briefcase },
      'Higher Education': { percent: 9, description: 'SUNY, CUNY, workforce development aligned with business needs', icon: GraduationCap },
      'Mental Hygiene': { percent: 8, description: 'Mental health and substance abuse treatment services', icon: Heart },
      'Transportation Infrastructure': { percent: 4, description: 'Transportation networks that support business and commerce', icon: Building },
      'Public Safety & Justice': { percent: 4, description: 'Business regulatory enforcement, commercial courts, public safety', icon: Shield },
      'General Government Operations': { percent: 4, description: 'State agencies that regulate and support business operations', icon: Building }
    },
    sales: {
      'Education/School Aid': { percent: 29, description: 'Sales tax contributes to state education funding', icon: GraduationCap },
      'Health/Medicaid': { percent: 27, description: 'Sales tax helps fund state healthcare programs', icon: Heart },
      'Local Government Aid': { percent: 20, description: 'State revenue sharing with local governments from sales tax', icon: Building },
      'Higher Education': { percent: 9, description: 'State universities and community colleges', icon: GraduationCap },
      'Mental Hygiene': { percent: 8, description: 'Mental health and developmental disability services', icon: Heart },
      'Transportation Infrastructure': { percent: 4, description: 'State transportation systems and infrastructure', icon: Building },
      'General State Operations': { percent: 3, description: 'Various state government operations and services', icon: Building }
    }
  };

  // Tax expenditures from the budget document (in millions)
  const taxExpenditures = {
    'Earned Income Credit': { amount: 1070.1, description: 'Tax credit for working families with low to moderate income' },
    'Social Security Exclusion': { amount: 1990.7, description: 'Excludes Social Security benefits from state tax' },
    'Pension/Annuity Exclusion': { amount: 1004.2, description: 'Tax relief for retirees on pension income' },
    'NY State/Municipal Retiree Benefits': { amount: 1410.4, description: 'Tax exemption for state and local government retirees' },
    'Empire State Child Credit': { amount: 691.0, description: 'Tax credit for families with children' },
    'Interest on US Obligations': { amount: 659.4, description: 'Federal law requires exemption of federal bond interest' },
    'Pass-through Entity Tax Credit': { amount: 14722.0, description: 'Credit for business owners paying entity-level tax' },
    'STAR Credit (New Homeowners)': { amount: 924.3, description: 'Property tax relief for new homeowners' },
    'STAR Credit (NYC Residents)': { amount: 748.4, description: 'Property tax relief for NYC residents' },
    'College Tuition Credit': { amount: 170.9, description: 'Tax credit for higher education expenses' }
  };

  // Simplified NY State tax calculation (2025 tax brackets)
  const calculateNYTax = (income: string, filingStatus: string) => {
    const adjustedIncome = parseFloat(income);
    if (isNaN(adjustedIncome) || adjustedIncome <= 0) return 0;

    // NY State tax brackets for 2025 (simplified - assumes standard deduction)
    const brackets = {
      single: [
        { min: 0, max: 8500, rate: 0.04 },
        { min: 8500, max: 11700, rate: 0.045 },
        { min: 11700, max: 13900, rate: 0.0525 },
        { min: 13900, max: 80650, rate: 0.055 },
        { min: 80650, max: 215400, rate: 0.06 },
        { min: 215400, max: 1077550, rate: 0.0685 },
        { min: 1077550, max: 5000000, rate: 0.0965 },
        { min: 5000000, max: 25000000, rate: 0.103 },
        { min: 25000000, max: Infinity, rate: 0.109 }
      ],
      marriedJoint: [
        { min: 0, max: 17150, rate: 0.04 },
        { min: 17150, max: 23600, rate: 0.045 },
        { min: 23600, max: 27900, rate: 0.0525 },
        { min: 27900, max: 161550, rate: 0.055 },
        { min: 161550, max: 323200, rate: 0.06 },
        { min: 323200, max: 2155350, rate: 0.0685 },
        { min: 2155350, max: 5000000, rate: 0.0965 },
        { min: 5000000, max: 25000000, rate: 0.103 },
        { min: 25000000, max: Infinity, rate: 0.109 }
      ],
      marriedSeparate: [
        { min: 0, max: 8500, rate: 0.04 },
        { min: 8500, max: 11700, rate: 0.045 },
        { min: 11700, max: 13900, rate: 0.0525 },
        { min: 13900, max: 80650, rate: 0.055 },
        { min: 80650, max: 161550, rate: 0.06 },
        { min: 161550, max: 1077550, rate: 0.0685 },
        { min: 1077550, max: 2500000, rate: 0.0965 },
        { min: 2500000, max: 12500000, rate: 0.103 },
        { min: 12500000, max: Infinity, rate: 0.109 }
      ],
      headOfHousehold: [
        { min: 0, max: 12800, rate: 0.04 },
        { min: 12800, max: 17650, rate: 0.045 },
        { min: 17650, max: 20900, rate: 0.0525 },
        { min: 20900, max: 107650, rate: 0.055 },
        { min: 107650, max: 269300, rate: 0.06 },
        { min: 269300, max: 1616450, rate: 0.0685 },
        { min: 1616450, max: 5000000, rate: 0.0965 },
        { min: 5000000, max: 25000000, rate: 0.103 },
        { min: 25000000, max: Infinity, rate: 0.109 }
      ],
      qualifyingWidow: [
        { min: 0, max: 17150, rate: 0.04 },
        { min: 17150, max: 23600, rate: 0.045 },
        { min: 23600, max: 27900, rate: 0.0525 },
        { min: 27900, max: 161550, rate: 0.055 },
        { min: 161550, max: 323200, rate: 0.06 },
        { min: 323200, max: 2155350, rate: 0.0685 },
        { min: 2155350, max: 5000000, rate: 0.0965 },
        { min: 5000000, max: 25000000, rate: 0.103 },
        { min: 25000000, max: Infinity, rate: 0.109 }
      ]
    };

    // NY State standard deductions for 2025
    const getStandardDeduction = (status: string) => {
      const deductions = {
        single: 8000,
        marriedJoint: 16050,
        marriedSeparate: 8000,
        headOfHousehold: 11200,
        qualifyingWidow: 16050
      };
      return deductions[status as keyof typeof deductions] || 8000;
    };

    const standardDeduction = getStandardDeduction(filingStatus);
    const taxableIncome = Math.max(0, adjustedIncome - standardDeduction);
    
    let tax = 0;
    const applicableBrackets = brackets[filingStatus as keyof typeof brackets] || brackets.single;
    
    for (const bracket of applicableBrackets) {
      if (taxableIncome > bracket.min) {
        const taxableInThisBracket = Math.min(taxableIncome - bracket.min, bracket.max - bracket.min);
        tax += taxableInThisBracket * bracket.rate;
      }
    }
    
    return tax;
  };

  const calculateAllocations = async () => {
    let finalTaxAmount = 0;
    
    if (activeTab === 'calculate') {
      if (!income || isNaN(parseFloat(income))) return;
      finalTaxAmount = calculateNYTax(income, filingStatus);
      setEstimatedTax(finalTaxAmount);
    } else {
      if (!taxAmount || isNaN(parseFloat(taxAmount))) return;
      finalTaxAmount = parseFloat(taxAmount);
      setEstimatedTax(finalTaxAmount);
    }
    
    const allocationType = budgetAllocations[taxType as keyof typeof budgetAllocations];
    const newAllocations: any = {};

    Object.entries(allocationType).forEach(([category, data]) => {
      newAllocations[category] = {
        amount: (finalTaxAmount * data.percent / 100).toFixed(2),
        percent: data.percent,
        description: data.description,
        icon: data.icon
      };
    });

    setAllocations(newAllocations);
    setShowResults(true);

    // Save calculation to D1 database
    try {
      const calculationData = {
        income: activeTab === 'calculate' ? parseFloat(income) : null,
        filingStatus: activeTab === 'calculate' ? filingStatus : null,
        taxType,
        calculatedTax: finalTaxAmount,
        taxAmountEntered: activeTab === 'direct' ? parseFloat(taxAmount) : null,
        calculationMethod: activeTab === 'calculate' ? 'income_based' : 'direct_entry',
        allocations: newAllocations
      };

      await fetch('/api/save-calculation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calculationData)
      });
    } catch (error) {
      console.error('Error saving calculation:', error);
      // Don't show error to user - this is just for analytics
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTotalStateRevenue = () => {
    // Based on the document: $147 billion collected in fiscal year 2024
    return 147000000000;
  };

  const calculateTaxExpenditureShare = (amount: number) => {
    const totalRevenue = getTotalStateRevenue();
    const userTaxAmount = estimatedTax || 0;
    const userShare = userTaxAmount / totalRevenue;
    return userShare * (amount * 1000000); // Convert millions to dollars
  };

  const getTaxTypeLabel = () => {
    const labels = {
      income: 'NY State Income Tax',
      corporate: 'NY State Corporate Tax',
      sales: 'NY State Sales Tax'
    };
    return labels[taxType as keyof typeof labels] || 'NY State Tax';
  };

  const getFilingStatusLabel = (status: string) => {
    const labels = {
      single: 'Single',
      marriedJoint: 'Married Filing Jointly',
      marriedSeparate: 'Married Filing Separately', 
      headOfHousehold: 'Head of Household',
      qualifyingWidow: 'Qualifying Widow(er)'
    };
    return labels[status as keyof typeof labels] || 'Single';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-blue-900 mb-4 flex items-center justify-center gap-3">
          <Calculator className="h-10 w-10" />
          New York State Tax Allocation Tool
        </h1>
        <p className="text-lg text-gray-800 max-w-3xl mx-auto">
          Discover exactly where your New York State tax dollars go. Enter your income or tax amount to see how much you contribute to each state program and service.
          <br/><br/>
          <span className="text-sm font-medium text-blue-800">Note: This tool covers New York State taxes only. Property taxes are local taxes collected and spent by counties, cities, towns, villages, and school districts.</span>
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-black">
          <DollarSign className="h-6 w-6" />
          Calculate Your Tax Allocation
        </h2>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('calculate')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'calculate' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Calculate from Income
          </button>
          <button
            onClick={() => setActiveTab('direct')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ml-4 ${
              activeTab === 'direct' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Enter Tax Amount
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'calculate' ? (
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-black">Annual Income ($)</label>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="Enter your annual income"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-black">Filing Status</label>
              <select
                value={filingStatus}
                onChange={(e) => setFilingStatus(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                <option value="single">Single</option>
                <option value="marriedJoint">Married Filing Jointly</option>
                <option value="marriedSeparate">Married Filing Separately</option>
                <option value="headOfHousehold">Head of Household</option>
                <option value="qualifyingWidow">Qualifying Widow(er)</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={calculateAllocations}
                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Calculate Allocation
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-black">Tax Amount ($)</label>
              <input
                type="number"
                value={taxAmount}
                onChange={(e) => setTaxAmount(e.target.value)}
                placeholder="Enter your tax amount"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-black">Tax Type</label>
              <select
                value={taxType}
                onChange={(e) => setTaxType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                <option value="income">Personal Income Tax</option>
                <option value="corporate">Corporate Tax</option>
                <option value="sales">Sales Tax</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={calculateAllocations}
                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Calculate Allocation
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'calculate' && (
          <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This calculation provides an estimate using standard deduction and basic tax brackets. 
              Actual taxes may vary based on itemized deductions, dependents, credits, and other factors.
            </p>
          </div>
        )}
      </div>

      {/* Results Section */}
      {showResults && Object.keys(allocations).length > 0 && (
        <div className="space-y-8">
          <div className="bg-green-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-black">
              <PieChart className="h-6 w-6" />
              Your {getTaxTypeLabel()} Breakdown
            </h2>
            <div className="mb-4 p-4 bg-white rounded-lg border-2 border-green-200">
              <p className="text-lg text-black">
                <strong>{getTaxTypeLabel()}:</strong> <span className="text-2xl font-bold text-green-600">{formatCurrency(estimatedTax)}</span>
              </p>
              {activeTab === 'calculate' && (
                <p className="text-sm text-gray-800 mt-1">
                  Based on {formatCurrency(parseFloat(income))} income, {getFilingStatusLabel(filingStatus)} status
                </p>
              )}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(allocations).map(([category, data]: [string, any]) => {
                const IconComponent = data.icon;
                return (
                  <div key={category} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <IconComponent className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-black mb-1">{category}</h3>
                        <p className="text-2xl font-bold text-green-600 mb-2">{formatCurrency(parseFloat(data.amount))}</p>
                        <p className="text-sm text-gray-800 mb-2">{data.description}</p>
                        <div className="bg-blue-100 rounded-full h-2 mb-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{width: `${data.percent}%`}}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-700">{data.percent}% of budget</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tax Expenditures Section - Only show for income tax */}
          {taxType === 'income' && (
            <div className="bg-yellow-50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-black">
                <FileText className="h-6 w-6" />
                Tax Credits & Exemptions You Help Fund
              </h2>
              <p className="text-gray-800 mb-4">
                Your income tax payment also helps fund various tax credits and exemptions that benefit other New Yorkers. Here's your proportional contribution:
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(taxExpenditures).slice(0, 6).map(([program, data]) => {
                  const yourShare = calculateTaxExpenditureShare(data.amount);
                  return (
                    <div key={program} className="bg-white p-4 rounded-lg border border-gray-200">
                      <h3 className="font-semibold text-black mb-1">{program}</h3>
                      <p className="text-lg font-bold text-orange-600 mb-2">{formatCurrency(yourShare)}</p>
                      <p className="text-sm text-gray-800">{data.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Context Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-black">
              <Info className="h-6 w-6" />
              Understanding Your Impact
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-black">Budget Context</h3>
                <ul className="space-y-2 text-sm text-gray-800">
                  <li>• NY State collected over $147 billion in fiscal year 2024</li>
                  <li>• Your {formatCurrency(estimatedTax)} represents {((estimatedTax / getTotalStateRevenue()) * 100).toExponential(2)}% of total revenue</li>
                  <li>• The FY 2026 budget is approximately $254 billion</li>
                  <li>• 80% of state operating funds come from taxes</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-black">Top Spending Areas</h3>
                <ul className="space-y-2 text-sm text-gray-800">
                  <li>• Education & School Aid: 29% of budget</li>
                  <li>• Health & Medicaid: 27% of budget</li>
                  <li>• Higher Education: 9% of budget</li>
                  <li>• Mental Health Services: 8% of budget</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-black">
              <FileText className="h-5 w-5" />
              Data Sources
            </h3>
            <p className="text-sm text-gray-800">
              This tool uses data from the FY 2026 New York State Tax Expenditure Report, OpenBudget.NY.Gov, 
              and the NY State Department of Taxation and Finance. Budget allocations are based on the 
              FY 2026 Enacted Budget State Operating Funds.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
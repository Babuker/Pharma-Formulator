#!/usr/bin/env python3
"""
Chemical Formula Optimizer - Main Application
AI-powered pharmaceutical formulation optimization
"""

import json
import sys
from flask import Flask, render_template, request, jsonify, send_file
from compliance_engine import ComplianceEngine
from optimizer import FormulaOptimizer
from cost_calculator import CostCalculator
from report_generator import ReportGenerator
import utils

app = Flask(__name__)

class ChemicalOptimizer:
    """Main optimizer application class"""
    
    def __init__(self):
        self.compliance_engine = ComplianceEngine()
        self.optimizer = FormulaOptimizer()
        self.cost_calculator = CostCalculator()
        self.report_generator = ReportGenerator()
        
    def optimize_formulation(self, input_data):
        """Main optimization pipeline"""
        
        # 1. Validate inputs
        if not self._validate_inputs(input_data):
            return {"error": "Invalid input parameters"}
        
        # 2. Check compliance
        compliance_result = self.compliance_engine.check_compliance(
            input_data['api_name'],
            input_data['dosage_form'],
            input_data['regulatory_target']
        )
        
        # 3. Generate formulation
        formulation = self.optimizer.generate_formulation(
            api_name=input_data['api_name'],
            api_dose=input_data['api_dose'],
            dosage_form=input_data['dosage_form'],
            strategy=input_data['strategy'],
            excipient_mode=input_data['excipient_mode']
        )
        
        # 4. Scale to batch size
        batch_details = self.cost_calculator.calculate_batch(
            formulation=formulation,
            batch_size=input_data['batch_size'],
            regulatory_target=input_data['regulatory_target']
        )
        
        # 5. Generate recommendations
        recommendations = self._generate_recommendations(
            formulation, 
            input_data['dosage_form'],
            batch_details
        )
        
        # 6. Compile results
        results = {
            "master_formula": formulation,
            "batch_details": batch_details,
            "recommendations": recommendations,
            "compliance_summary": compliance_result,
            "input_parameters": input_data
        }
        
        return results
    
    def _validate_inputs(self, input_data):
        """Validate all input parameters"""
        required_fields = [
            'api_name', 'api_dose', 'dosage_form', 
            'batch_size', 'regulatory_target', 'strategy'
        ]
        
        for field in required_fields:
            if field not in input_data:
                return False
        
        # Validate dose is positive number
        try:
            if float(input_data['api_dose']) <= 0:
                return False
        except ValueError:
            return False
            
        return True
    
    def _generate_recommendations(self, formulation, dosage_form, batch_details):
        """Generate production and storage recommendations"""
        
        recommendations = {
            "production_method": self._suggest_production_method(dosage_form, formulation),
            "packaging": self._suggest_packaging(dosage_form, formulation),
            "storage_conditions": self._suggest_storage(formulation),
            "stability_considerations": [],
            "manufacturing_notes": []
        }
        
        # Add stability notes based on excipients
        for excipient in formulation.get('excipients', []):
            if 'hygroscopic' in excipient.get('properties', '').lower():
                recommendations['stability_considerations'].append(
                    f"{excipient['name']} is hygroscopic - control humidity during manufacturing"
                )
        
        return recommendations
    
    def _suggest_production_method(self, dosage_form, formulation):
        """Suggest appropriate production method"""
        methods = {
            "tablet": "Direct compression or wet granulation based on API properties",
            "capsule": "Powder blending and encapsulation",
            "liquid": "Solution/suspension manufacturing with homogenization",
            "ointment": "Heating and mixing under controlled conditions"
        }
        return methods.get(dosage_form.lower(), "Standard pharmaceutical manufacturing")
    
    def _suggest_packaging(self, dosage_form, formulation):
        """Suggest appropriate packaging"""
        packaging = {
            "tablet": "Blister packs (ALU/ALU) or HDPE bottles with desiccant",
            "capsule": "Blister packs or glass bottles",
            "liquid": "Amber glass bottles with child-resistant caps",
            "ointment": "Collapsible tubes or jars"
        }
        return packaging.get(dosage_form.lower(), "Appropriate pharmaceutical packaging")
    
    def _suggest_storage(self, formulation):
        """Suggest storage conditions"""
        return {
            "temperature": "Store at 15-25°C (controlled room temperature)",
            "humidity": "Store below 60% relative humidity",
            "light": "Protect from light",
            "container": "Keep in tightly closed container"
        }

# Flask routes
@app.route('/')
def index():
    """Render main page"""
    return render_template('index.html')

@app.route('/optimize', methods=['POST'])
def optimize():
    """API endpoint for optimization"""
    try:
        input_data = request.get_json()
        
        # Initialize optimizer
        optimizer = ChemicalOptimizer()
        
        # Run optimization
        results = optimizer.optimize_formulation(input_data)
        
        # Generate PDF if requested
        if request.args.get('pdf', '').lower() == 'true':
            pdf_path = optimizer.report_generator.generate_pdf(results)
            return send_file(pdf_path, as_attachment=True)
        
        return jsonify(results)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/excipients', methods=['GET'])
def get_excipients():
    """Get list of available excipients"""
    with open('data/excipients.json', 'r') as f:
        excipients = json.load(f)
    
    # Filter by dosage form if specified
    dosage_form = request.args.get('dosage_form')
    if dosage_form:
        filtered = {}
        for key, value in excipients.items():
            if dosage_form.lower() in [df.lower() for df in value.get('compatible_forms', [])]:
                filtered[key] = value
        return jsonify(filtered)
    
    return jsonify(excipients)

def run_cli():
    """Command line interface"""
    if len(sys.argv) < 2:
        print("Usage: python main.py <input_json_file>")
        print("Example: python main.py examples/sample_input.json")
        sys.exit(1)
    
    # Load input file
    with open(sys.argv[1], 'r') as f:
        input_data = json.load(f)
    
    # Run optimization
    optimizer = ChemicalOptimizer()
    results = optimizer.optimize_formulation(input_data)
    
    # Print results
    print("\n" + "="*60)
    print("CHEMICAL FORMULA OPTIMIZATION RESULTS")
    print("="*60)
    
    if "error" in results:
        print(f"Error: {results['error']}")
    else:
        utils.print_results(results)
        
        # Ask to save PDF
        save_pdf = input("\nGenerate PDF report? (y/n): ")
        if save_pdf.lower() == 'y':
            pdf_path = optimizer.report_generator.generate_pdf(results)
            print(f"PDF report saved to: {pdf_path}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        run_cli()
    else:
        app.run(debug=True, port=5000)

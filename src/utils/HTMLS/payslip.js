export const payslip = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 40px;
        color: #333;
      }
      .header {
        text-align: center;
        border-bottom: 3px solid #007bff;
        padding-bottom: 20px;
        margin-bottom: 30px;
      }
      .company-logo {
        max-width: 150px;
        max-height: 80px;
        margin-bottom: 10px;
      }
      .payslip-title {
        font-size: 28px;
        font-weight: bold;
        color: #007bff;
      }
      .period {
        font-size: 14px;
        color: #666;
        margin-top: 10px;
      }
      .section {
        margin: 30px 0;
      }
      .section-title {
        background: #007bff;
        color: white;
        padding: 10px;
        font-weight: bold;
      }
      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        padding: 20px;
        background: #f9f9f9;
      }
      .info-item {
        padding: 5px 0;
      }
      .label {
        font-weight: bold;
        color: #666;
      }
      .earnings-table,
      .deductions-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }
      .earnings-table th,
      .deductions-table th {
        padding: 10px;
        text-align: left;
      }
      .earnings-table th {
        background: #28a745;
        color: white;
      }
      .deductions-table th {
        background: #dc3545;
        color: white;
      }
      .earnings-table td,
      .deductions-table td {
        padding: 8px;
        border-bottom: 1px solid #ddd;
      }
      .total-row {
        font-weight: bold;
        background: #f0f0f0;
      }
      .net-pay {
        font-size: 24px;
        font-weight: bold;
        color: #28a745;
        text-align: center;
        padding: 20px;
        background: #e8f5e9;
        margin-top: 30px;
      }
      .footer {
        margin-top: 50px;
        padding-top: 20px;
        border-top: 2px solid #ddd;
        text-align: center;
        font-size: 12px;
        color: #666;
      }
      .empty-row {
        text-align: center;
        color: #999;
        font-style: italic;
      }
    </style>
  </head>
  <body>
    <div class="header">
      {{#companyLogo}}
        <img class="company-logo" src="{{companyLogo}}" alt="Company Logo" />
      {{/companyLogo}}
      <div class="payslip-title">PAYSLIP</div>
      <div class="period">For the period: {{period}}</div>
    </div>

    <div class="section">
      <div class="section-title">Employee Information</div>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">Name:</span> {{workerName}}
        </div>
        <div class="info-item">
          <span class="label">Employee ID:</span> {{workerId}}
        </div>
        <div class="info-item">
          <span class="label">Department:</span> {{department}}
        </div>
        <div class="info-item">
          <span class="label">Position:</span> {{position}}
        </div>
        <div class="info-item">
          <span class="label">Date of Joining:</span> {{dateOfJoining}}
        </div>
        <div class="info-item">
          <span class="label">Payment Date:</span> {{paymentDate}}
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Company Information</div>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">Company:</span> {{companyName}}
        </div>
        <div class="info-item">
          <span class="label">Address:</span> {{companyAddress}}
        </div>
        <div class="info-item">
          <span class="label">Phone:</span> {{companyPhone}}
        </div>
        <div class="info-item">
          <span class="label">Email:</span> {{companyEmail}}
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Earnings</div>
      <table class="earnings-table">
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: right;">Amount ({{currency}})</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Basic Salary</td>
            <td style="text-align: right;">{{basicSalary}}</td>
          </tr>

          {{#allowances}}
          <tr>
            <td>{{name}}</td>
            <td style="text-align: right;">{{amount}}</td>
          </tr>
          {{/allowances}}

          {{^allowances}}
          <tr><td class="empty-row" colspan="2">No allowances</td></tr>
          {{/allowances}}

          <tr class="total-row">
            <td>Total Earnings</td>
            <td style="text-align: right;">{{totalEarnings}}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Deductions</div>
      <table class="deductions-table">
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: right;">Amount ({{currency}})</th>
          </tr>
        </thead>
        <tbody>
          {{#deductions}}
          <tr>
            <td>{{name}}</td>
            <td style="text-align: right;">{{amount}}</td>
          </tr>
          {{/deductions}}

          {{^deductions}}
          <tr><td class="empty-row" colspan="2">No deductions</td></tr>
          {{/deductions}}

          <tr class="total-row">
            <td>Total Deductions</td>
            <td style="text-align: right;">{{totalDeductions}}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="net-pay">NET PAY: {{currency}} {{netPay}}</div>

    <div class="footer">
      <p>This is a computer-generated payslip. No signature is required.</p>
      <p>Generated on: {{systemGenerationDate}}</p>
      <p>For any queries, please contact HR at {{companyEmail}}</p>
    </div>
  </body>
</html>
`;
export const payslip_spanish =`<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 40px;
        color: #333;
      }
      .header {
        text-align: center;
        border-bottom: 3px solid #007bff;
        padding-bottom: 20px;
        margin-bottom: 30px;
      }
      .company-logo {
        max-width: 150px;
        max-height: 80px;
        margin-bottom: 10px;
      }
      .payslip-title {
        font-size: 28px;
        font-weight: bold;
        color: #007bff;
      }
      .period {
        font-size: 14px;
        color: #666;
        margin-top: 10px;
      }
      .section {
        margin: 30px 0;
      }
      .section-title {
        background: #007bff;
        color: white;
        padding: 10px;
        font-weight: bold;
      }
      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        padding: 20px;
        background: #f9f9f9;
      }
      .info-item {
        padding: 5px 0;
      }
      .label {
        font-weight: bold;
        color: #666;
      }
      .earnings-table,
      .deductions-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }
      .earnings-table th,
      .deductions-table th {
        padding: 10px;
        text-align: left;
      }
      .earnings-table th {
        background: #28a745;
        color: white;
      }
      .deductions-table th {
        background: #dc3545;
        color: white;
      }
      .earnings-table td,
      .deductions-table td {
        padding: 8px;
        border-bottom: 1px solid #ddd;
      }
      .total-row {
        font-weight: bold;
        background: #f0f0f0;
      }
      .net-pay {
        font-size: 24px;
        font-weight: bold;
        color: #28a745;
        text-align: center;
        padding: 20px;
        background: #e8f5e9;
        margin-top: 30px;
      }
      .footer {
        margin-top: 50px;
        padding-top: 20px;
        border-top: 2px solid #ddd;
        text-align: center;
        font-size: 12px;
        color: #666;
      }
      .empty-row {
        text-align: center;
        color: #999;
        font-style: italic;
      }
    </style>
  </head>
  <body>
    <div class="header">
      {{#companyLogo}}
        <img class="company-logo" src="{{companyLogo}}" alt="Logo de la Empresa" />
      {{/companyLogo}}
      <div class="payslip-title">NÓMINA</div>
      <div class="period">Período: {{period}}</div>
    </div>

    <div class="section">
      <div class="section-title">Información del Empleado</div>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">Nombre:</span> {{workerName}}
        </div>
        <div class="info-item">
          <span class="label">ID de Empleado:</span> {{workerId}}
        </div>
        <div class="info-item">
          <span class="label">Departamento:</span> {{department}}
        </div>
        <div class="info-item">
          <span class="label">Cargo:</span> {{position}}
        </div>
        <div class="info-item">
          <span class="label">Fecha de Ingreso:</span> {{dateOfJoining}}
        </div>
        <div class="info-item">
          <span class="label">Fecha de Pago:</span> {{paymentDate}}
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Información de la Empresa</div>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">Empresa:</span> {{companyName}}
        </div>
        <div class="info-item">
          <span class="label">Dirección:</span> {{companyAddress}}
        </div>
        <div class="info-item">
          <span class="label">Teléfono:</span> {{companyPhone}}
        </div>
        <div class="info-item">
          <span class="label">Email:</span> {{companyEmail}}
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Percepciones</div>
      <table class="earnings-table">
        <thead>
          <tr>
            <th>Descripción</th>
            <th style="text-align: right;">Monto ({{currency}})</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Salario Básico</td>
            <td style="text-align: right;">{{basicSalary}}</td>
          </tr>

          {{#allowances}}
          <tr>
            <td>{{name}}</td>
            <td style="text-align: right;">{{amount}}</td>
          </tr>
          {{/allowances}}

          {{^allowances}}
          <tr><td class="empty-row" colspan="2">Sin percepciones</td></tr>
          {{/allowances}}

          <tr class="total-row">
            <td>Total Percepciones</td>
            <td style="text-align: right;">{{totalEarnings}}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Deducciones</div>
      <table class="deductions-table">
        <thead>
          <tr>
            <th>Descripción</th>
            <th style="text-align: right;">Monto ({{currency}})</th>
          </tr>
        </thead>
        <tbody>
          {{#deductions}}
          <tr>
            <td>{{name}}</td>
            <td style="text-align: right;">{{amount}}</td>
          </tr>
          {{/deductions}}

          {{^deductions}}
          <tr><td class="empty-row" colspan="2">Sin deducciones</td></tr>
          {{/deductions}}

          <tr class="total-row">
            <td>Total Deducciones</td>
            <td style="text-align: right;">{{totalDeductions}}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="net-pay">PAGO NETO: {{currency}} {{netPay}}</div>

    <div class="footer">
      <p>Esta nómina ha sido generada por computadora. No requiere firma.</p>
      <p>Generado el: {{systemGenerationDate}}</p>
      <p>Para consultas, contacte a RRHH en {{companyEmail}}</p>
    </div>
  </body>
</html>
`
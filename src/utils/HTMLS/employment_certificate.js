export const employment_certificate = `<!DOCTYPE html>
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
        margin-bottom: 30px;
      }
      .company-logo {
        max-width: 150px;
        margin-bottom: 20px;
      }
      .company-info {
        font-size: 12px;
        color: #666;
      }
      .certificate-title {
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        margin: 40px 0;
        text-transform: uppercase;
      }
      .content {
        line-height: 1.8;
        font-size: 14px;
      }
      .worker-details {
        margin: 30px 0;
        background: #f9f9f9;
        padding: 20px;
        border-left: 4px solid #007bff;
      }
      .footer {
        margin-top: 60px;
        text-align: center;
        font-size: 12px;
        color: #666;
      }
      .signature-section {
        margin-top: 80px;
        text-align: right;
      }
    </style>
  </head>
  <body>
    <div class="header">
      {{#companyLogo}}
      <img src="{{companyLogo}}" class="company-logo" alt="Company Logo" />
      {{/companyLogo}}
      <h1>{{companyName}}</h1>
      <div class="company-info">
        {{companyAddress}}<br />
        Phone: {{companyPhone}} | Email: {{companyEmail}}<br />
        Website: {{companyWebsite}}
      </div>
    </div>

    <div class="certificate-title">Employment Certificate</div>

    <div class="content">
      <p>To Whom It May Concern,</p>

      <p>This is to certify that the following individual is employed at <strong>{{companyName}}</strong>:</p>

      <div class="worker-details">
        <strong>Full Name:</strong> {{workerName}}<br />
        <strong>ID Number:</strong> {{workerId}}<br />
        <strong>Date of Birth:</strong> {{dob}}<br />
        <strong>Position:</strong> {{position}}<br />
        <strong>Department:</strong> {{department}}<br />
        <strong>Date of Joining:</strong> {{dateOfJoining}}<br />
        <strong>Salary:</strong> {{salary}} {{currency}}<br />
        <strong>Work Schedule:</strong> {{workSchedule}}<br />
        <strong>Email:</strong> {{workerEmail}}<br />
        <strong>Phone:</strong> {{workerPhone}}<br />
        <strong>Status:</strong> {{status}}<br />

        {{#achievements}}
        <strong>Achievements:</strong> {{achievements}}<br />
        {{/achievements}}

        {{#remarks}}
        <strong>Remarks:</strong> {{remarks}}<br />
        {{/remarks}}
      </div>

      <p>
        {{workerName}} has been employed with <strong>{{companyName}}</strong> since {{dateOfJoining}} as a <strong>{{position}}</strong> in the <strong>{{department}}</strong> department. Their performance and conduct have been satisfactory throughout their tenure.
      </p>

      <p>
        This certificate is issued upon the request of the employee for {{#purpose}}{{purpose}}{{/purpose}}{{^purpose}}official purposes{{/purpose}}.
      </p>

      <p>
        Should you require any further information, please do not hesitate to contact us.
      </p>
    </div>

    <div class="signature-section">
      <p>_______________________</p>
      <p><strong>{{companyName}}</strong></p>
      <p>Authorized Signatory</p>
      <p>Date: {{currentDate}}</p>
    </div>

    <div class="footer">
      <p>This is a computer-generated document. No signature is required.</p>
      <p>
        Generated on: {{systemGenerationDate}} | Registration Date: {{systemRegistrationDate}}
      </p>
    </div>
  </body>
</html>
`;
export const employment_certificate_Spanish = `<!DOCTYPE html>
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
        margin-bottom: 30px;
      }
      .company-logo {
        max-width: 150px;
        margin-bottom: 20px;
      }
      .company-info {
        font-size: 12px;
        color: #666;
      }
      .certificate-title {
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        margin: 40px 0;
        text-transform: uppercase;
      }
      .content {
        line-height: 1.8;
        font-size: 14px;
      }
      .worker-details {
        margin: 30px 0;
        background: #f9f9f9;
        padding: 20px;
        border-left: 4px solid #007bff;
      }
      .footer {
        margin-top: 60px;
        text-align: center;
        font-size: 12px;
        color: #666;
      }
      .signature-section {
        margin-top: 80px;
        text-align: right;
      }
    </style>
  </head>
  <body>
    <div class="header">
      {{#companyLogo}}
      <img src="{{companyLogo}}" class="company-logo" alt="Logo de la Empresa" />
      {{/companyLogo}}

      <h1>{{companyName}}</h1>

      <div class="company-info">
        {{companyAddress}}<br />
        Teléfono: {{companyPhone}} | Email: {{companyEmail}}<br />
        Sitio Web: {{companyWebsite}}
      </div>
    </div>

    <div class="certificate-title">Certificado de Empleo</div>

    <div class="content">
      <p>A quien corresponda,</p>

      <p>
        Por la presente se certifica que la siguiente persona se encuentra empleada en
        <strong>{{companyName}}</strong>:
      </p>

      <div class="worker-details">
        <strong>Nombre Completo:</strong> {{workerName}}<br />
        <strong>Número de Identificación:</strong> {{workerId}}<br />
        <strong>Fecha de Nacimiento:</strong> {{dob}}<br />
        <strong>Cargo:</strong> {{position}}<br />
        <strong>Departamento:</strong> {{department}}<br />
        <strong>Fecha de Ingreso:</strong> {{dateOfJoining}}<br />
        <strong>Salario:</strong> {{salary}} {{currency}}<br />
        <strong>Horario de Trabajo:</strong> {{workSchedule}}<br />
        <strong>Email:</strong> {{workerEmail}}<br />
        <strong>Teléfono:</strong> {{workerPhone}}<br />
        <strong>Estado:</strong> {{status}}<br />

        {{#achievements}}
        <strong>Logros:</strong> {{achievements}}<br />
        {{/achievements}}

        {{#remarks}}
        <strong>Observaciones:</strong> {{remarks}}<br />
        {{/remarks}}
      </div>

      <p>
        {{workerName}} ha estado empleado en <strong>{{companyName}}</strong> desde
        {{dateOfJoining}} como <strong>{{position}}</strong> en el departamento de
        <strong>{{department}}</strong>. Su desempeño y conducta han sido satisfactorios
        durante su tiempo de servicio.
      </p>

      <p>
        Este certificado se emite a solicitud del empleado para
        {{#purpose}}{{purpose}}{{/purpose}}{{^purpose}}fines oficiales{{/purpose}}.
      </p>

      <p>
        Si requiere información adicional, no dude en ponerse en contacto con nosotros.
      </p>
    </div>

    <div class="signature-section">
      <p>_______________________</p>
      <p><strong>{{companyName}}</strong></p>
      <p>Representante Autorizado</p>
      <p>Fecha: {{currentDate}}</p>
    </div>

    <div class="footer">
      <p>Este es un documento generado por computadora. No requiere firma.</p>
      <p>
        Generado el: {{systemGenerationDate}} | Fecha de Registro:
        {{systemRegistrationDate}}
      </p>
    </div>
  </body>
</html>
`;

import { Form } from "react-router"
import { type DeliveryCarrierService } from "app/lib/services/index"

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function CarrierServiceForm({ actionData, carrierService }: { actionData?: any, carrierService?: DeliveryCarrierService }) {
	return (
		<Form method="POST" data-save-bar id={`CarrierServiceForm-${carrierService?.id ?? 'new'}`}>
			<input type="hidden" name="formType" value="carrierService" />

			<s-section heading="Carrier Services">
				<s-grid gap="base" gridTemplateColumns="1fr 1fr">
					{
						carrierService?.id && (
							<s-text-field
								label="ID del Carrier Service"
								placeholder="ID del carrier service"
								name="id"
								readOnly
								value={carrierService?.id ?? ''}
							/>
						)
					}

					<s-grid-item gridColumn="span 2">
						<s-switch 
							label="Activar Carrier Service" 
							details="Asegurate de que todo esté configurado correctamente antes de activar el carrier service" 
							name="active"
							checked={carrierService?.active ?? false}
						/>
					</s-grid-item>

					<s-text-field 
						label="Nombre" 
						placeholder="Nombre del carrier service" 
						name="name"
						required
						error={actionData?.errors?.name}
						value={carrierService?.name ?? ''}
					/>

					<s-text-field 
						label="URL de callback" 
						placeholder="Endpoint de tu API" 
						name="callbackUrl"
						required
						error={actionData?.errors?.callbackUrl}
						value={carrierService?.callbackUrl ?? ''}
					/>

					<s-grid-item gridColumn="span 2">
						<s-switch 
							label="Soporta Service Discovery" 
							details="Asegurate de que soporta service discovery antes de activarlo" 
							name="supportsServiceDiscovery"
							checked={carrierService?.supportsServiceDiscovery ?? false}
						/>
					</s-grid-item>
				</s-grid>
			</s-section>
		</Form>
	)
}
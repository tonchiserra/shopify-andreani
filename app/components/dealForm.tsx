import { Form } from "react-router"
import { DealWithRelations } from "app/lib/services/index"

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function DealForm({actionData, deal}: {actionData?: any, deal?: DealWithRelations}) {

	return (
		<Form method="post" data-save-bar>
			<s-stack gap="base">
				
				<s-section heading="Información básica">
					<s-stack gap="base">
						
						<s-grid gap="base" gridTemplateColumns="repeat(auto-fit, minmax(100px, 1fr))">
							{deal?.id && (
								<s-grid-item>
									<s-text-field
										label="ID del contrato" 
										placeholder="ID generado automáticamente" 
										name="id"
										disabled
										value={deal.id}
									></s-text-field>
								</s-grid-item>
							)}

							<s-grid-item>
								<s-text-field 
									label="Nombre del contrato" 
									placeholder="Ej: Envío a domicilio" 
									name="name"
									required
									error={actionData?.errors?.name}
									value={deal?.name ?? ''}
								></s-text-field>
							</s-grid-item>
							
							<s-grid-item>
								<s-text-field 
									label="Número del contrato" 
									placeholder="Ej: 400008125" 
									name="number"
									required
									error={actionData?.errors?.number}
									value={deal?.number ?? ''}
								></s-text-field>
							</s-grid-item>
						</s-grid>

						<s-money-field 
							label="Precio base" 
							details="Precio base del contrato" 
							placeholder="0.00" 
							name="price"
							required
							value={deal?.price?.toString() ?? ''}
						></s-money-field>
					</s-stack>
				</s-section>

				<s-section heading="Configuración de envío">
					<s-stack gap="base">
						<s-switch 
							label="Envío a ubicación específica" 
							details="Activar si el contrato requiere envío a una ubicación específica" 
							name="toLocation"
							checked={deal?.toLocation}
						></s-switch>
						
						<s-switch 
							label="Envío gratuito" 
							details="Marcar si este contrato incluye envío gratuito" 
							name="freeShipping"
							checked={deal?.freeShipping}
						></s-switch>
					</s-stack>
				</s-section>

				{deal?.createdAt && deal?.updatedAt && (
					<s-section heading="Información">
						<s-grid gap="base" gridTemplateColumns="repeat(auto-fit, minmax(100px, 1fr))">
							<s-grid-item>
								<s-text-field 
									label="Fecha de creación" 
									placeholder="Ej: 2023-01-01 10:30:00" 
									name="createdAt"
									disabled
									value={deal?.createdAt ? new Date(deal.createdAt).toLocaleString() : ''}
								></s-text-field>
							</s-grid-item>

							<s-grid-item>
								<s-text-field 
									label="Fecha de última actualización" 
									placeholder="Ej: 2023-01-01" 
									name="updatedAt"
									disabled
									value={deal?.updatedAt ? new Date(deal.updatedAt).toLocaleString() : ''}
								></s-text-field>
							</s-grid-item>
						</s-grid>
					</s-section>
				)}

			</s-stack>
		</Form>
	)
}
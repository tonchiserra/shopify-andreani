import { Form } from "react-router"
import { SenderWithRelations, ShopifyLocation } from "app/lib/services/index"
import { useState } from "react"

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function SenderForm({actionData, sender, locations}: {actionData?: any, sender?: SenderWithRelations | null, locations: ShopifyLocation[] }) {

	const [selectedLocation, setSelectedLocation] = useState<ShopifyLocation | null>(null)

	const handleLocationChange = (e: any) => {
		const locationId = e.currentTarget.value
		const location = locations.find(loc => loc.id === locationId) || null
		setSelectedLocation(location)
	}

	return (
		<Form method="post" data-save-bar>
			<s-stack gap="base">
				
				<s-section heading="Información del remitente">
					<s-stack gap="base">
						
						<s-grid gap="base" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))">
							{sender?.id && (
								<s-grid-item>
									<s-text-field
										label="ID del remitente" 
										placeholder="ID generado automáticamente" 
										name="id"
										disabled
										value={sender.id}
									></s-text-field>
								</s-grid-item>
							)}

							<s-grid-item>
								<s-select 
									label="Tipo de documento" 
									name="docType"
									required
									error={actionData?.errors?.docType}
									value={sender?.docType ?? ''}
								>
									<s-option value="">Seleccionar tipo</s-option>
									<s-option value="CUIT">CUIT</s-option>
									<s-option value="CUIL">CUIL</s-option>
									<s-option value="DNI">DNI</s-option>
									<s-option value="OTRO">Otro</s-option>
								</s-select>
							</s-grid-item>
							
							<s-grid-item>
								<s-text-field 
									label="Número de documento" 
									placeholder="Ej: 20-12345678-9" 
									name="docNum"
									required
									error={actionData?.errors?.docNum}
									value={sender?.docNum ?? ''}
								></s-text-field>
							</s-grid-item>

							<s-grid-item>
								<s-text-field 
									label="Código de oficina" 
									placeholder="Ej: SUC001" 
									name="officeCode"
									required
									error={actionData?.errors?.officeCode}
									value={sender?.officeCode ?? ''}
								></s-text-field>
							</s-grid-item>
						</s-grid>
					</s-stack>
				</s-section>

				<s-section heading="Dirección del remitente">
					<s-stack gap="base">
						<s-grid gap="base" gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))">
							<s-grid-item>
								<s-select 
									label="Shopify Location" 
									name="locationId"
									error={actionData?.errors?.locationId}
									value={sender?.locationId ?? ''}
									onInput={handleLocationChange}
								>
									<s-option value="">Seleccionar Location</s-option>
									{locations.map(location => <s-option key={location.id} value={location.id} selected={location.id === sender?.locationId}>{location.name}</s-option>)}
								</s-select>
							</s-grid-item>

							<s-grid-item>
								<s-text-field 
									label="Nombre / Razón social" 
									placeholder="Ej: Empresa SA" 
									name="locationName"
									required
									error={actionData?.errors?.locationName}
									value={selectedLocation?.name ?? sender?.location?.name ?? ''}
								></s-text-field>
							</s-grid-item>

							<s-grid-item>
								<s-text-field 
									label="Dirección 1" 
									name="address1"
									required
									error={actionData?.errors?.address1}
									value={selectedLocation?.address?.address1 ?? sender?.location?.address1 ?? ''}
								></s-text-field>
							</s-grid-item>

							<s-grid-item>
								<s-text-field 
									label="Dirección 2" 
									name="address2"
									value={selectedLocation?.address?.address2 ?? sender?.location?.address2 ?? ''}
                                    disabled
								></s-text-field>
							</s-grid-item>

							<s-grid-item>
								<s-text-field 
									label="Ciudad" 
									name="city"
									required
									error={actionData?.errors?.city}
									value={selectedLocation?.address?.city ?? sender?.location?.city ?? ''}
								></s-text-field>
							</s-grid-item>

							<s-grid-item>
								<s-text-field 
									label="Provincia" 
									name="province"
									required
									error={actionData?.errors?.province}
									value={selectedLocation?.address?.province ?? sender?.location?.province ?? ''}
								></s-text-field>
							</s-grid-item>

							<s-grid-item>
								<s-text-field 
									label="País" 
									name="country"
									value={selectedLocation?.address?.country ?? sender?.location?.country ?? ''}
                                    disabled
								></s-text-field>
							</s-grid-item>

							<s-grid-item>
								<s-text-field 
									label="Código postal" 
									name="zip"
									value={selectedLocation?.address?.zip ?? sender?.location?.zip ?? ''}
                                    disabled
								></s-text-field>
							</s-grid-item>

							<s-grid-item>
								<s-text-field 
									label="Teléfono" 
									placeholder="Ej: +543476624319" 
									name="phone"
									value={sender?.location?.phone ?? ''}
								></s-text-field>
							</s-grid-item>
						</s-grid>

						<s-switch 
							label="Activo" 
							details="Marcar si el remitente está activo" 
							name="active"
							checked={sender?.location?.active ?? true}
						></s-switch>
					</s-stack>
				</s-section>

			</s-stack>
		</Form>
	)
}
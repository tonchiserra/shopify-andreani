import { Form } from "react-router"
import { SenderWithRelations, ShopifyLocation, DealWithRelations } from "app/lib/services/index"
import { useState } from "react"

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function SenderForm({actionData, sender, locations, deals = [], senders = []}: {actionData?: any, sender?: SenderWithRelations | null, locations: ShopifyLocation[], deals?: DealWithRelations[], senders?: SenderWithRelations[]}) {

	const [selectedLocation, setSelectedLocation] = useState<ShopifyLocation | null>(null)
	const [selectedDealIds, setSelectedDealIds] = useState<string[]>(
		sender?.deals?.map(d => d.deal.id) || []
	)

	const handleLocationChange = (e: any) => {
		const newLocationId = e.currentTarget.value
		const location = locations.find(loc => loc.id === newLocationId) || null
		setSelectedLocation(location)
	}

	const handleDealChange = (dealId: string, isChecked: boolean) => {
		if (isChecked) {
			setSelectedDealIds(prev => [...prev, dealId])
		} else {
			setSelectedDealIds(prev => prev.filter(id => id !== dealId))
		}
	}

	const isInUse = (locationId: string) => {
		return senders.some(s => s.locationId === locationId && s.id !== sender?.id)
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
										readOnly
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

							<s-switch 
								label="Activo" 
								details="Marcar si el remitente está activo" 
								name="active"
								checked={sender?.active ?? false}
							></s-switch>
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
									required
								>
									<s-option value="">Seleccionar Location</s-option>
									{locations.map(location => <s-option key={location.id} value={location.id} selected={location.id === sender?.locationId} disabled={isInUse(location.id)}>{location.name}</s-option>)}
								</s-select>
							</s-grid-item>

							<s-grid-item>
								<s-text-field 
									label="Nombre / Razón social" 
									placeholder="Ej: Empresa SA" 
									name="locationName"
									required
									error={actionData?.errors?.locationName}
									value={selectedLocation?.name ?? sender?.locationName ?? ''}
								></s-text-field>
							</s-grid-item>

							<s-grid-item>
								<s-text-field 
									label="Dirección 1" 
									name="locationAddress1"
									value={selectedLocation?.address?.address1 ?? sender?.locationAddress1 ?? ''}
									readOnly
								></s-text-field>
							</s-grid-item>

							<s-grid-item>
								<s-text-field 
									label="Dirección 2" 
									name="locationAddress2"
									value={selectedLocation?.address?.address2 ?? sender?.locationAddress2 ?? ''}
                                    readOnly
								></s-text-field>
							</s-grid-item>

							<s-grid-item>
								<s-text-field 
									label="Ciudad" 
									name="locationCity"
									value={selectedLocation?.address?.city ?? sender?.locationCity ?? ''}
									readOnly
								></s-text-field>
							</s-grid-item>

							<s-grid-item>
								<s-text-field 
									label="Provincia" 
									name="locationProvince"
									value={selectedLocation?.address?.province ?? sender?.locationProvince ?? ''}
									readOnly
								></s-text-field>
							</s-grid-item>

							<s-grid-item>
								<s-text-field 
									label="País" 
									name="locationCountry"
									value={selectedLocation?.address?.country ?? sender?.locationCountry ?? ''}
                                    readOnly
								></s-text-field>
							</s-grid-item>

							<s-grid-item>
								<s-text-field 
									label="Código postal" 
									name="locationZip"
									value={selectedLocation?.address?.zip ?? sender?.locationZip ?? ''}
                                    readOnly
								></s-text-field>
							</s-grid-item>

							<s-grid-item>
								<s-text-field 
									label="Teléfono" 
									placeholder="Ej: +543476624319" 
									name="locationPhone"
									value={selectedLocation?.address?.phone ?? sender?.locationPhone ?? ''}
								></s-text-field>
							</s-grid-item>
						</s-grid>
					</s-stack>
				</s-section>

				{deals.length > 0 && (
					<s-section heading="Contratos asociados">
						<s-stack gap="base">
							<s-text>
								Selecciona los contratos que estarán asociados a este remitente
							</s-text>
							<s-stack gap="none">
								{deals.map((deal) => (
									<s-checkbox
										key={deal.id}
										label={`${deal.name} - Nº ${deal.number}`}
										name="dealIds"
										value={deal.id}
										checked={selectedDealIds.includes(deal.id)}
										onChange={(e: any) => handleDealChange(deal.id, e.currentTarget.checked)}
									/>
								))}
							</s-stack>
						</s-stack>
					</s-section>
				)}

				{sender?.createdAt && sender?.updatedAt && (
					<s-section heading="Información">
						<s-grid gap="base" gridTemplateColumns="repeat(auto-fit, minmax(100px, 1fr))">
							<s-grid-item>
								<s-text-field 
									label="Fecha de creación" 
									placeholder="Ej: 2023-01-01 10:30:00" 
									name="createdAt"
									disabled
									value={sender?.createdAt ? new Date(sender.createdAt).toLocaleString() : ''}
								></s-text-field>
							</s-grid-item>

							<s-grid-item>
								<s-text-field 
									label="Fecha de última actualización" 
									placeholder="Ej: 2023-01-01" 
									name="updatedAt"
									disabled
									value={sender?.updatedAt ? new Date(sender.updatedAt).toLocaleString() : ''}
								></s-text-field>
							</s-grid-item>
						</s-grid>
					</s-section>
				)}

			</s-stack>
		</Form>
	)
}
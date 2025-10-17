import { Modal, TitleBar} from '@shopify/app-bridge-react'
import { showModal, hideModal } from "app/lib/utils/shopify-apis"
import { Form } from "react-router"
import { type DeliveryCarrierService } from 'app/lib/services/index'
import { parseCarrierServiceId } from 'app/lib/utils/helpers'

export default function CarrierServicesTable({ carrierServices }: { carrierServices: Array<DeliveryCarrierService> }) {
	return (
		<s-box borderRadius="large" overflow="hidden" border="base">
			<s-table>
				<s-table-header-row>
					<s-table-header>Nombre</s-table-header>
					<s-table-header>Estado</s-table-header>
					<s-table-header>URL de Callback</s-table-header>
					<s-table-header>Service Discovery</s-table-header>
					<s-table-header></s-table-header>
				</s-table-header-row>

				<s-table-body>
					{ carrierServices.map((carrierService) => (
						<s-table-row key={carrierService.id}>
							<s-table-cell>
								<s-clickable href={`/app/carrier-services/${parseCarrierServiceId(carrierService.id)}`} padding="small small-400" borderRadius="small">
									{carrierService.name ?? carrierService.formattedName ?? 'Sin nombre'}
								</s-clickable>
							</s-table-cell>
							<s-table-cell>
								<s-badge tone={carrierService.active ? "success" : "critical"}>
									{carrierService.active ? "Activo" : "Inactivo"}
								</s-badge>
							</s-table-cell>
							<s-table-cell>
                                <s-text>{carrierService.callbackUrl ?? '-'}</s-text>
							</s-table-cell>
							<s-table-cell>
								<s-badge tone={carrierService.supportsServiceDiscovery ? "success" : "critical"}>
									{carrierService.supportsServiceDiscovery ? "Soportado" : "No soportado"}
								</s-badge>
							</s-table-cell>
							<s-table-cell>
								<s-grid gridTemplateColumns="auto auto" justifyContent="end" gap="small-300">
									<s-button icon="edit" variant="primary" href={`/app/carrier-services/${parseCarrierServiceId(carrierService.id)}`}></s-button>
									
									<s-button 
										icon="delete" 
										variant="primary" 
										tone="critical"
										type="button"
										onClick={async () => showModal(`delete-carrier-service-modal-${carrierService.id}`)}
									></s-button>

									<Modal id={`delete-carrier-service-modal-${carrierService.id}`}>
										<TitleBar title="¿Eliminar carrier service?" />
										<s-stack>
											<s-box padding="base">
												<s-text>
													¿Estás seguro que deseas eliminar el carrier service &quot;{carrierService.name || carrierService.formattedName || 'Sin nombre'}&quot;? Esta acción no se puede deshacer.
												</s-text>
											</s-box>
											<s-divider />
											<s-box padding="base">
												<s-stack direction="inline" gap="small" justifyContent="end">
													<s-button 
														variant="secondary"
														onClick={() => hideModal(`delete-carrier-service-modal-${carrierService.id}`)}
													>
														Cancelar
													</s-button>
													<Form method="post">
														<input type="hidden" name="intent" value="delete" />
														<input type="hidden" name="id" value={carrierService.id} />
														<s-button 
															variant="primary" 
															tone="critical" 
															type="submit"
															onClick={() => hideModal(`delete-carrier-service-modal-${carrierService.id}`)}
														>
															Eliminar
														</s-button>
													</Form>
												</s-stack>
											</s-box>
										</s-stack>
									</Modal>
								</s-grid>
							</s-table-cell>
						</s-table-row>
					))}
				</s-table-body>
			</s-table>
		</s-box>
	)
}
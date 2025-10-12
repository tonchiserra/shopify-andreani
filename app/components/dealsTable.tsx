import { Modal, TitleBar} from '@shopify/app-bridge-react'
import { showModal, hideModal } from "app/lib/utils/shopify-apis"
import { Form } from "react-router"
import { type DealWithRelations } from 'app/lib/services/index'

export default function DealsTable({ deals }: { deals: Array<DealWithRelations> }) {
	return (
		<s-box borderRadius="large" overflow="hidden" border="base">
			<s-table>
				<s-table-header-row>
					<s-table-header>Nombre</s-table-header>
					<s-table-header>Nº Contrato</s-table-header>
					<s-table-header>Precio</s-table-header>
					<s-table-header>¿Envío sucursal?</s-table-header>
					<s-table-header>¿Envío gratis?</s-table-header>
					<s-table-header>Remitentes</s-table-header>
					<s-table-header></s-table-header>
				</s-table-header-row>

				<s-table-body>
					{ deals.map((deal) => (
						<s-table-row key={deal.id}>
							<s-table-cell>
								<s-clickable href={`/app/deals/${deal.id}`} padding="small small-400" borderRadius="small">
									{deal.name}
								</s-clickable>
							</s-table-cell>
							<s-table-cell>{deal.number}</s-table-cell>
							<s-table-cell>${deal.price.toFixed(2)}</s-table-cell>
							<s-table-cell>
								<s-badge tone={deal.toLocation ? "success" : "critical"}>
									{deal.toLocation ? "Envío a sucursal" : "Envío a domicilio"}
								</s-badge>
							</s-table-cell>
							<s-table-cell>
								<s-badge tone={deal.freeShipping ? "success" : "critical"}>
									{deal.freeShipping ? "Envío gratis" : "Envío con costo"}
								</s-badge>
							</s-table-cell>
							<s-table-cell>
									<s-stack>
										{ (!deal.senders || deal.senders.length === 0) && '-' }
										{ deal.senders && deal.senders.length > 0 && deal.senders.map(sender => (
											<s-text key={sender.id}>{sender.sender.locationName || '-'}</s-text>
										)) }
									</s-stack>
								</s-table-cell>
							<s-table-cell>
								<s-grid gridTemplateColumns="auto auto" justifyContent="end" gap="small-300">
									<s-button icon="edit" variant="primary" href={`/app/deals/${deal.id}`}></s-button>
									
									<s-button 
										icon="delete" 
										variant="primary" 
										tone="critical"
										type="button"
										onClick={async () => showModal(`delete-sender-modal-${deal.id}`)}
									></s-button>

									<Modal id={`delete-sender-modal-${deal.id}`}>
										<TitleBar title="¿Eliminar contrato?" />
										<s-stack>
											<s-box padding="base">
												<s-text>
													¿Estás seguro que deseas eliminar el contrato &quot;{deal.name || 'Sin nombre'}&quot;? 
													Esta acción no se puede deshacer.
												</s-text>
											</s-box>
											<s-divider />
											<s-box padding="base">
												<s-stack direction="inline" gap="small" justifyContent="end">
													<s-button 
														variant="secondary"
														onClick={() => hideModal(`delete-deal-modal-${deal.id}`)}
													>
														Cancelar
													</s-button>
													<Form method="post">
														<input type="hidden" name="intent" value="delete" />
														<input type="hidden" name="dealId" value={deal.id} />
														<s-button 
															variant="primary" 
															tone="critical" 
															type="submit"
															onClick={() => hideModal(`delete-deal-modal-${deal.id}`)}
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
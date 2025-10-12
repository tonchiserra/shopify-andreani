import { Form } from "react-router"
import { type SenderWithRelations } from "app/lib/services/index"
import { showModal, hideModal } from "app/lib/utils/shopify-apis"
import {Modal, TitleBar} from '@shopify/app-bridge-react'

export default function SendersTable({ senders }: { senders: Array<SenderWithRelations> }) {
	return (
		<s-box borderRadius="large" overflow="hidden" border="base">
			<s-table>
				<s-table-header-row>
					<s-table-header>Nombre</s-table-header>
					<s-table-header>Código de oficina</s-table-header>
					<s-table-header>¿Activo?</s-table-header>
					<s-table-header>Dirección</s-table-header>
					<s-table-header>Ciudad</s-table-header>
					<s-table-header>Teléfono</s-table-header>
					<s-table-header>Contratos</s-table-header>
					<s-table-header></s-table-header>
				</s-table-header-row>

				<s-table-body>
					{senders.length && (
						senders.map((sender: SenderWithRelations) => (
							<s-table-row key={sender.id}>
								<s-table-cell>
									<s-clickable href={`/app/senders/${sender.id}`} padding="small small-400" borderRadius="small">
										{sender.locationName || '-'}
									</s-clickable>
								</s-table-cell>
								<s-table-cell>{sender.officeCode || '-'}</s-table-cell>
								<s-table-cell>
									<s-badge tone={sender.active ? "success" : "critical"}>
										{sender.active ? "Activo" : "No activo"}
									</s-badge>
								</s-table-cell>
								<s-table-cell>{sender.locationAddress1 || '-'}</s-table-cell>
								<s-table-cell>{sender.locationCity || '-'}</s-table-cell>
								<s-table-cell>{sender.locationPhone || '-'}</s-table-cell>
								<s-table-cell>
									<s-stack>
										{ (!sender.deals || sender.deals.length === 0) && '-' }
										{ sender.deals && sender.deals.length > 0 && sender.deals.map(deal => (
											<s-text key={deal.id}>{deal.deal.name || '-'}</s-text>
										)) }
									</s-stack>
								</s-table-cell>
								<s-table-cell>
									<s-grid gridTemplateColumns="auto auto" justifyContent="end" gap="small-300">
										<s-button icon="edit" variant="primary" href={`/app/senders/${sender.id}`}></s-button>
										
										<s-button 
											icon="delete" 
											variant="primary" 
											tone="critical"
											type="button"
											onClick={async () => showModal(`delete-sender-modal-${sender.id}`)}
										></s-button>

										<Modal id={`delete-sender-modal-${sender.id}`}>
											<TitleBar title="¿Eliminar remitente?" />
											<s-stack>
												<s-box padding="base">
													<s-text>
														¿Estás seguro que deseas eliminar el remitente &quot;{sender.locationName || 'Sin nombre'}&quot;? 
														Esta acción no se puede deshacer.
													</s-text>
												</s-box>
												<s-divider />
												<s-box padding="base">
													<s-stack direction="inline" gap="small" justifyContent="end">
														<s-button 
															variant="secondary"
															onClick={() => hideModal(`delete-sender-modal-${sender.id}`)}
														>
															Cancelar
														</s-button>
														<Form method="post">
															<input type="hidden" name="intent" value="delete" />
															<input type="hidden" name="senderId" value={sender.id} />
															<s-button 
																variant="primary" 
																tone="critical" 
																type="submit"
																onClick={() => hideModal(`delete-sender-modal-${sender.id}`)}
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
						))
					)}
				</s-table-body>
			</s-table>
		</s-box>
	)
}
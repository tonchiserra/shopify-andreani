import { useLoaderData, type HeadersFunction, type LoaderFunctionArgs, Form, useActionData } from "react-router"
import { authenticate } from "../shopify.server"
import { boundary } from "@shopify/shopify-app-react-router/server"
import { AppMode, configService, type ConfigWithRelations } from "app/lib/services/index"
import { useEffect } from "react"
import { showToast } from "app/lib/utils/shopify-apis"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request)

  const config = await configService.getOrCreateConfig()

  return { config } as { config: ConfigWithRelations }
}

export const action = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request)
  
  try {
    const formData = await request.formData()

      const configData = {
        enabled: formData.get('enabled') === 'on',
        isProduction: formData.get('mode') === 'production',
        appMode: formData.get('appMode') as AppMode,
        accessData: {
          user: formData.get('user') as string,
          pass: formData.get('pass') as string,
          clientId: formData.get('clientId') as string,
          urlProd: formData.get('urlProd') as string,
          urlTest: formData.get('urlTest') as string,
        },
        freeShippingThreshold: parseFloat(formData.get('freeShippingThreshold') as string) || 0,
        defaultWeight: parseFloat(formData.get('defaultWeight') as string) || 0,
      }
      
      await configService.update(configData)
      
      return { success: true, message: 'Configuración guardada exitosamente' }
    
  } catch (error) {
    console.error('Error saving data:', error)
    return { success: false, message: 'Error al guardar los datos' }
  }
}

export default function Index() {
  const { config } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  
  useEffect(() => {
    if(actionData?.message) {
      showToast(actionData.message, {
        duration: 5000,
        isError: !actionData.success
      })
    }
  }, [actionData])
  
  if(!config) return null

  return (
    <s-page heading="Configuración">
      <s-stack gap="base" padding="base none">

        <Form method="post" data-save-bar id="config-form">
          <input type="hidden" name="formType" value="config" />
          <s-stack gap="base">
            <s-section heading="General">
              <s-stack gap="base">
                <s-switch 
                  label="Activar app" 
                  details="Asegurate de que todo esté configurado correctamente antes de activar la app" 
                  name="enabled"
                  checked={config.enabled}
                />
                
                <s-grid gap="base" gridTemplateColumns="1fr 1fr">
                  <s-grid-item>
                    <s-select 
                      label="Modo de la app"
                      name="mode"
                      value={config.isProduction ? 'production' : 'test'}
                    >
                      <s-option value="production">Producción</s-option>
                      <s-option value="test">Test</s-option>
                    </s-select>
                  </s-grid-item>
                  
                  <s-grid-item>
                    <s-select 
                      label="Tipo de etiqueta"
                      name="appMode"
                      value={config.appMode}
                    >
                      <s-option value="manual">Manual</s-option>
                      <s-option value="auto">Automático</s-option>
                    </s-select>
                  </s-grid-item>
                </s-grid>
              </s-stack>
            </s-section>

            <s-section heading="Datos de acceso de Andreani">
              <s-grid gap="base" gridTemplateColumns="repeat(6, 1fr)">
                <s-grid-item gridColumn="span 2">
                  <s-text-field 
                    label="Usuario" 
                    placeholder="Usuario de Andreani" 
                    name="user"
                    value={config.accessData?.user || ''}
                  />
                </s-grid-item>
                <s-grid-item gridColumn="span 2">
                  <s-text-field 
                    label="Contraseña" 
                    placeholder="Contraseña de Andreani" 
                    name="pass"
                    value={config.accessData?.pass || ''}
                  />
                </s-grid-item>
                <s-grid-item gridColumn="span 2">
                  <s-text-field 
                    label="Client ID" 
                    placeholder="ID de cliente de Andreani" 
                    name="clientId"
                    value={config.accessData?.clientId || ''}
                  />
                </s-grid-item>
                <s-grid-item gridColumn="span 3">
                  <s-text-field 
                    label="URL de producción" 
                    placeholder="URL de la API de producción" 
                    name="urlProd"
                    value={config.accessData?.urlProd || ''}
                  />
                </s-grid-item>
                <s-grid-item gridColumn="span 3">
                  <s-text-field 
                    label="URL de prueba" 
                    placeholder="URL de la API de prueba" 
                    name="urlTest"
                    value={config.accessData?.urlTest || ''}
                  />
                </s-grid-item>
              </s-grid>
            </s-section>

            <s-section heading="Otros ajustes">
              <s-grid gap="base" gridTemplateColumns="1fr 1fr">
                <s-money-field 
                  label="Envío gratis" 
                  details="Monto mínimo para desbloquear envío gratis" 
                  placeholder="100" 
                  name="freeShippingThreshold"
                  value={config.freeShippingThreshold?.toString()}
                />

                <s-money-field 
                  label="Peso por defecto" 
                  details="Valores expresados en gramos. Se tomará este valor en caso que el producto no tenga un peso asociado" 
                  placeholder="500" 
                  name="defaultWeight"
                  value={config.defaultWeight?.toString()}
                />
              </s-grid>
            </s-section>
          </s-stack>
        </Form>
      </s-stack>
    </s-page>
  )
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs)
}

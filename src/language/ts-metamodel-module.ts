import type { DefaultSharedModuleContext, LangiumServices, LangiumSharedServices, Module, PartialLangiumServices } from 'langium';
import { createDefaultModule, createDefaultSharedModule, inject } from 'langium';
import { TsMetamodelGeneratedModule, TsMetamodelGeneratedSharedModule } from './generated/module.js';
import { TsMetamodelValidator, registerValidationChecks } from './ts-metamodel-validator.js';
import { TsMetamodelSemanticTokenization } from './lsp/ts-metamodel-semantic-tokenization.js';
import { TsMetamodelScopeProvider } from './lsp/ts-metamodel-scope-provider.js';
import { TsMetamodelCompletionProvider } from './lsp/ts-metamodel-completion-provider.js';

/**
 * Declaration of custom services - add your own service classes here.
 */
export type TsMetamodelAddedServices = {
    validation: {
        TsMetamodelValidator: TsMetamodelValidator
    }
}

/**
 * Union of Langium default services and your custom services - use this as constructor parameter
 * of custom service classes.
 */
export type TsMetamodelServices = LangiumServices & TsMetamodelAddedServices

/**
 * Dependency injection module that overrides Langium default services and contributes the
 * declared custom services. The Langium defaults can be partially specified to override only
 * selected services, while the custom services must be fully specified.
 */
export const TsMetamodelModule: Module<TsMetamodelServices, PartialLangiumServices & TsMetamodelAddedServices> = {
    lsp: {
        SemanticTokenProvider: (services) => new TsMetamodelSemanticTokenization(services),
        CompletionProvider: (services) => new TsMetamodelCompletionProvider(services)
    },
    references: {
        ScopeProvider: (services) => new TsMetamodelScopeProvider(services)
    },
    validation: {
        TsMetamodelValidator: () => new TsMetamodelValidator()
    }
};

/**
 * Create the full set of services required by Langium.
 *
 * First inject the shared services by merging two modules:
 *  - Langium default shared services
 *  - Services generated by langium-cli
 *
 * Then inject the language-specific services by merging three modules:
 *  - Langium default language-specific services
 *  - Services generated by langium-cli
 *  - Services specified in this file
 *
 * @param context Optional module context with the LSP connection
 * @returns An object wrapping the shared services and the language-specific services
 */
export function createTsMetamodelServices(context: DefaultSharedModuleContext): {
    shared: LangiumSharedServices,
    TsMetamodel: TsMetamodelServices
} {
    const shared = inject(
        createDefaultSharedModule(context),
        TsMetamodelGeneratedSharedModule
    );
    const TsMetamodel = inject(
        createDefaultModule({ shared }),
        TsMetamodelGeneratedModule,
        TsMetamodelModule
    );
    shared.ServiceRegistry.register(TsMetamodel);
    registerValidationChecks(TsMetamodel);
    return { shared, TsMetamodel };
}

/**
 * WordPress dependencies
 */
import { createSlotFill } from '@wordpress/components';
import { isRTL, __ } from '@wordpress/i18n';
import { drawerLeft, drawerRight } from '@wordpress/icons';
import { useEffect, Fragment } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as interfaceStore } from '@wordpress/interface';
import { store as blockEditorStore } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import DefaultSidebar from './default-sidebar';
import GlobalStylesSidebar from './global-styles-sidebar';
import { STORE_NAME } from '../../store/constants';
import SettingsHeader from './settings-header';
import TemplatePanel from './template-panel';
import { SIDEBAR_BLOCK, SIDEBAR_TEMPLATE } from './constants';
import { store as editSiteStore } from '../../store';
import PagePanels from './page-panels';

const { Slot: InspectorSlot, Fill: InspectorFill } = createSlotFill(
	'EditSiteSidebarInspector'
);
export const SidebarInspectorFill = InspectorFill;

export function SidebarComplementaryAreaFills() {
	const {
		sidebar,
		isEditorSidebarOpened,
		hasBlockSelection,
		supportsGlobalStyles,
		hasPageContentLock,
	} = useSelect( ( select ) => {
		const _sidebar =
			select( interfaceStore ).getActiveComplementaryArea( STORE_NAME );
		const _isEditorSidebarOpened = [
			SIDEBAR_BLOCK,
			SIDEBAR_TEMPLATE,
		].includes( _sidebar );
		const settings = select( editSiteStore ).getSettings();
		return {
			sidebar: _sidebar,
			isEditorSidebarOpened: _isEditorSidebarOpened,
			hasBlockSelection:
				!! select( blockEditorStore ).getBlockSelectionStart(),
			supportsGlobalStyles: ! settings?.supportsTemplatePartsMode,
			hasPageContentLock: select( editSiteStore ).hasPageContentLock(),
		};
	}, [] );
	const { enableComplementaryArea } = useDispatch( interfaceStore );

	useEffect( () => {
		if ( ! isEditorSidebarOpened ) return;
		if ( hasBlockSelection ) {
			enableComplementaryArea( STORE_NAME, SIDEBAR_BLOCK );
		} else {
			enableComplementaryArea( STORE_NAME, SIDEBAR_TEMPLATE );
		}
	}, [ hasBlockSelection, isEditorSidebarOpened ] );

	let sidebarName = sidebar;
	if ( ! isEditorSidebarOpened ) {
		sidebarName = hasBlockSelection ? SIDEBAR_BLOCK : SIDEBAR_TEMPLATE;
	}

	return (
		<>
			<DefaultSidebar
				identifier={ sidebarName }
				title={ __( 'Settings' ) }
				icon={ isRTL() ? drawerLeft : drawerRight }
				closeLabel={ __( 'Close settings' ) }
				header={ <SettingsHeader sidebarName={ sidebarName } /> }
				headerClassName="edit-site-sidebar-edit-mode__panel-tabs"
			>
				{ sidebarName === SIDEBAR_TEMPLATE &&
					( hasPageContentLock ? (
						<PagePanels />
					) : (
						<TemplatePanel />
					) ) }
				{ sidebarName === SIDEBAR_BLOCK && (
					<InspectorSlot bubblesVirtually />
				) }
			</DefaultSidebar>
			{ supportsGlobalStyles && <GlobalStylesSidebar /> }
		</>
	);
}

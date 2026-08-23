> **Offline teaching derivative**  
> Source: `github/docs@4f8c3170cea7f72cf41fc976f5dbf4e8a0b8567f`  
> Upstream path: `content/actions/how-tos/reuse-automations/share-across-private-repositories.md`  
> Upstream Git blob: `00b53e3c8945a57dace696f631e91c3f469c5ce3`  
> Transform: `markdown-normalize`  
> This Markdown is generated for agent use. Consult `originals/` when exact upstream bytes matter.

---
title: Sharing actions and workflows from your private repository
intro: You can share an action or reusable workflow without publishing them publicly.
versions:
  fpt: '*'
shortTitle: Share across private repositories
redirect_from:
  - /actions/creating-actions/sharing-actions-and-workflows-from-your-private-repository
  - /actions/sharing-automations/sharing-actions-and-workflows-from-your-private-repository
  - /actions/how-tos/sharing-automations/sharing-actions-and-workflows-from-your-private-repository
category:
  - Reuse and share automations
contentType: how-tos
---

> [!WARNING]
> * {% data reusables.actions.outside-collaborators-actions %}
> * {% data reusables.actions.scoped-token-note %}

## Sharing actions and workflows from your private repository

1. Store the action or reusable workflow in a private repository. For more information, see [AUTOTITLE](/repositories/creating-and-managing-repositories/about-repositories#about-repository-visibility).
1. On {% data variables.product.prodname_dotcom %}, navigate to the main page of the private repository.
1. Under your repository name, click **{% octicon "gear" aria-hidden="true" aria-label="gear" %} Settings**.
{% data reusables.repositories.settings-sidebar-actions-general %}
1. To grant access to other private repositories, in the **Access** section at the bottom of the page, select **Accessible from repositories owned by 'USERNAME' user**.
1. Click **Save** to apply the settings.

## Next steps

To reuse your shared workflows, see [AUTOTITLE](/actions/how-tos/reuse-automations/reuse-workflows).
